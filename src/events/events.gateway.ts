// src/events/events.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';

// Définition de l'interface pour un message de chat
interface ChatMessagePayload {
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
}

// Définition de l'interface pour les données de connexion (simulées pour l'exemple)
interface UserSocket extends Socket {
  userId?: number; // Ajoute une propriété userId au socket pour l'identification
}

// @WebSocketGateway(port, options)
// et le port du frontend (généralement 5173 pour Vite).
// L'option 'cors' est essentielle pour permettre les connexions depuis votre frontend React.
@WebSocketGateway({
  cors: {
    origin: '*', // Permet toutes les origines pour le développement. À restreindre en production.
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server; // L'instance du serveur Socket.IO

  private readonly logger = new Logger(EventsGateway.name);

  // Mappe les IDs utilisateur aux IDs de socket pour faciliter l'envoi de messages directs
  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(
    private readonly messagesService: MessagesService, // Injectez le MessagesService
  ) {}

  // Gère la connexion d'un nouveau client
  handleConnection(@ConnectedSocket() client: UserSocket, ...args: any[]) {
    // Dans une vraie application, vous authentifieriez l'utilisateur ici
    // et assigneriez un userId au socket. Pour cet exemple, nous le ferons
    // via un message 'registerUser' du client.
  }

  // Gère la déconnexion d'un client
  handleDisconnect(@ConnectedSocket() client: UserSocket) {
    // Supprime l'utilisateur de la map des connectés
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  /**
   * Permet à un client de s'enregistrer avec son userId.
   * C'est crucial pour pouvoir envoyer des messages à des utilisateurs spécifiques.
   * @param client Le socket du client connecté.
   * @param userId L'ID de l'utilisateur qui se connecte.
   */
  @SubscribeMessage('registerUser')
  handleRegisterUser(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() userId: number,
  ): void {
    client.userId = userId; // Associe l'ID utilisateur au socket
    this.connectedUsers.set(userId, client.id);
  
    this.server.to(client.id).emit('userRegistered', userId); // Confirme l'enregistrement
  }

  /**
   * Gère l'envoi d'un message de chat.
   * Le message est envoyé à une "room" spécifique à la conversation.
   * @param client Le socket du client qui envoie le message.
   * @param payload Les données du message (senderId, receiverId, content).
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() payload: { receiverId: number; content: string },
  ): Promise<void> {
    // Assurez-vous que l'expéditeur est enregistré
    if (!client.userId) {
      this.server
        .to(client.id)
        .emit('error', "Veuillez vous enregistrer d'abord.");
      return;
    }

    const senderId = client.userId;
    const { receiverId, content } = payload;

    if (!content.trim()) {
      this.server
        .to(client.id)
        .emit('error', 'Le message ne peut pas être vide.');
      return;
    }

    try {
      // Enregistrer le message via le MessagesService
      const savedMessage = await this.messagesService.saveMessage(
        senderId,
        receiverId,
        content,
      );

      // Créez un ID de room unique et cohérent pour la conversation
      // en triant les IDs des deux participants.
      const participants = [senderId, receiverId].sort((a, b) => a - b);
      const roomId = `chat_${participants[0]}_${participants[1]}`;

      // Rejoindre la room (l'expéditeur doit rejoindre la room s'il ne l'a pas déjà fait)
      client.join(roomId);

      // Si le destinataire est connecté, assurez-vous qu'il rejoint aussi la room
      const receiverSocketId = this.connectedUsers.get(receiverId);
      if (receiverSocketId) {
        const receiverSocket =
          this.server.sockets.sockets.get(receiverSocketId);
        if (receiverSocket) {
          receiverSocket.join(roomId);
        }
      }

      const message: ChatMessagePayload = {
        senderId: senderId,
        receiverId: receiverId,
        content: content.trim(),
        timestamp: savedMessage.timestamp.toISOString(),
      };

      // Émet le message à tous les clients dans la room (y compris l'expéditeur)
      this.server.to(roomId).emit('receiveMessage', message);
      
      // Log pour debug
      
    } catch (error) {
      this.server
        .to(client.id)
        .emit('error', "Erreur lors de l'envoi du message");
    }
  }

  /**
   * Permet à un client de rejoindre une conversation spécifique.
   * Utile pour charger l'historique ou s'assurer que l'utilisateur est dans la bonne room.
   * @param client Le socket du client.
   * @param payload Les IDs des deux participants pour construire la room.
   */
  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() payload: { user1Id: number; user2Id: number },
  ): Promise<void> {
    
    if (!client.userId) {
      
      this.server
        .to(client.id)
        .emit('error', "Veuillez vous enregistrer d'abord.");
      return;
    }

    const { user1Id, user2Id } = payload;
    const participants = [user1Id, user2Id].sort();
    const roomId = `chat_${participants[0]}_${participants[1]}`;

    client.join(roomId);
    
    this.server.to(client.id).emit('chatJoined', roomId); // Confirme que la room a été rejointe
    try {
      // Récupérer l'historique des messages via le MessagesService
      const history = await this.messagesService.getConversationHistory(
        user1Id,
        user2Id,
      );
     
      // Mapper les messages de l'entité Message vers l'interface ChatMessagePayload attendue par le frontend
      const formattedHistory: ChatMessagePayload[] = history.map((msg) => ({
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(), // Convertir Date en string ISO
      }));
      client.emit('chatHistory', formattedHistory); // Envoyer l'historique au client
     
    } catch (error) {
     
      client.emit('error', "Erreur lors du chargement de l'historique");
    }
  }

  /**
   * NOUVEAU: Gère la demande de la liste des conversations pour un propriétaire.
   * @param client Le socket du client.
   * @param ownerId L'ID du propriétaire.
   */
  @SubscribeMessage('getOwnerConversations')
  async handleGetOwnerConversations(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() ownerId: number,
  ): Promise<void> {

    if (!ownerId) {
      this.server.to(client.id).emit('error', 'ID propriétaire manquant.');
      return;
    }
    
    try {
      const conversations = await this.messagesService.getOwnerConversations(ownerId);
      
      // Émet les conversations au client qui a fait la demande
      this.server.to(client.id).emit('ownerConversations', conversations);
    } catch (error) {
      this.server.to(client.id).emit('error', `Erreur lors du chargement des conversations.`);
    }
  }
}

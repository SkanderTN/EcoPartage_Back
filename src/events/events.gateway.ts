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
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

// Définition de l'interface pour les données de connexion (simulées pour l'exemple)
interface UserSocket extends Socket {
  userId?: string; // Ajoute une propriété userId au socket pour l'identification
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
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly messagesService: MessagesService, // Injectez le MessagesService
  ) {}

  // Gère la connexion d'un nouveau client
  handleConnection(@ConnectedSocket() client: UserSocket, ...args: any[]) {
    this.logger.log(`Client connecté: ${client.id}`);
    // Dans une vraie application, vous authentifieriez l'utilisateur ici
    // et assigneriez un userId au socket. Pour cet exemple, nous le ferons
    // via un message 'registerUser' du client.
  }

  // Gère la déconnexion d'un client
  handleDisconnect(@ConnectedSocket() client: UserSocket) {
    this.logger.log(`Client déconnecté: ${client.id}`);
    // Supprime l'utilisateur de la map des connectés
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        this.logger.log(`Utilisateur ${userId} déconnecté.`);
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
    @MessageBody() userId: string,
  ): void {
    client.userId = userId; // Associe l'ID utilisateur au socket
    this.connectedUsers.set(userId, client.id);
    this.logger.log(
      `Utilisateur ${userId} enregistré avec le socket ${client.id}`,
    );
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
    @MessageBody() payload: { receiverId: string; content: string },
  ): Promise<void> {
    // Assurez-vous que l'expéditeur est enregistré
    if (!client.userId) {
      this.logger.warn(`Message reçu d'un client non enregistré: ${client.id}`);
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
      const participants = [senderId, receiverId].sort();
      const roomId = `chat_${participants[0]}_${participants[1]}`;

      // Rejoindre la room (l'expéditeur doit rejoindre la room s'il ne l'a pas déjà fait)
      client.join(roomId);
      this.logger.log(`Client ${senderId} a rejoint la room: ${roomId}`);

      // Si le destinataire est connecté, assurez-vous qu'il rejoint aussi la room
      const receiverSocketId = this.connectedUsers.get(receiverId);
      if (receiverSocketId) {
        const receiverSocket =
          this.server.sockets.sockets.get(receiverSocketId);
        if (receiverSocket) {
          receiverSocket.join(roomId);
          this.logger.log(`Client ${receiverId} a rejoint la room: ${roomId}`);
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
      this.logger.log(
        `Message envoyé dans la room ${roomId}: ${JSON.stringify(message)}`,
      );
      // Log pour debug
      this.logger.log(
        `Clients dans la room ${roomId}:`,
        this.server.sockets.adapter.rooms.get(roomId),
      );
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi du message: ${error.message}`);
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
    @MessageBody() payload: { user1Id: string; user2Id: string },
  ): Promise<void> {
    this.logger.log(
      `Tentative de joinChat reçue de ${client.id}: ${JSON.stringify(payload)}`,
    );
    if (!client.userId) {
      this.logger.warn(
        `Client non enregistré tente de rejoindre un chat: ${client.id}`,
      );
      this.server
        .to(client.id)
        .emit('error', "Veuillez vous enregistrer d'abord.");
      return;
    }

    const { user1Id, user2Id } = payload;
    const participants = [user1Id, user2Id].sort();
    const roomId = `chat_${participants[0]}_${participants[1]}`;

    client.join(roomId);
    this.logger.log(
      `Client ${client.userId} a explicitement rejoint la room: ${roomId}`,
    );
    this.server.to(client.id).emit('chatJoined', roomId); // Confirme que la room a été rejointe
    try {
      // Récupérer l'historique des messages via le MessagesService
      const history = await this.messagesService.getConversationHistory(
        user1Id,
        user2Id,
      );
      this.logger.log(
        `${history.length} messages trouvés dans l'historique pour ${user1Id} et ${user2Id}`,
      );
      // Mapper les messages de l'entité Message vers l'interface ChatMessagePayload attendue par le frontend
      const formattedHistory: ChatMessagePayload[] = history.map((msg) => ({
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(), // Convertir Date en string ISO
      }));
      client.emit('chatHistory', formattedHistory); // Envoyer l'historique au client
      this.logger.log(
        `Historique de ${formattedHistory.length} messages envoyé à ${client.id} pour la room ${roomId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de l'historique: ${error.message}`,
      );
      client.emit('error', "Erreur lors du chargement de l'historique");
    }
  }
}

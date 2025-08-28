// backend/src/messages/messages.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { UserService } from '../user/user.service'; 


// Nouvelle interface pour définir la structure d'une conversation
interface ConversationSummary {
  userId: number;
  userName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private readonly userService: UserService,
  ) {}

  /**
   * @method saveMessage
   * @description Enregistre un nouveau message dans la base de données.
   * @param {number} senderId - L'ID de l'expéditeur.
   * @param {number} receiverId - L'ID du destinataire.
   * @param {string} content - Le contenu du message.
   * @returns {Promise<Message>} Le message enregistré.
   */
  async saveMessage(
    senderId: number,
    receiverId: number,
    content: string,
  ): Promise<Message> {
    const newMessage = this.messagesRepository.create({
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
    });
    const savedMessage = await this.messagesRepository.save(newMessage);
    
    return savedMessage;
  }

  /**
   * @method getConversationHistory
   * @description Récupère l'historique des messages entre deux utilisateurs.
   * Les messages sont triés par horodatage.
   * @param {number} user1Id - L'ID du premier utilisateur.
   * @param {number} user2Id - L'ID du second utilisateur.
   * @returns {Promise<Message[]>} Un tableau des messages de la conversation.
   */
  async getConversationHistory(
    user1Id: number,
    user2Id: number,
  ): Promise<Message[]> {
    // Récupère les messages où user1 est l'expéditeur et user2 le destinataire, OU l'inverse.
    const messages = await this.messagesRepository.find({
      where: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
      order: {
        timestamp: 'ASC', // Tri par ordre chronologique
      },
    });
  
    return messages;
  }

  /**
   * @method getOwnerConversations
   * @description Récupère toutes les conversations d'un propriétaire (utilisateur qui reçoit des messages).
   * Retourne la liste des utilisateurs qui ont envoyé des messages au propriétaire,
   * avec le dernier message et le nombre de messages non lus pour chaque conversation.
   * @param {number} ownerId - L'ID du propriétaire.
   * @returns {Promise<ConversationSummary[]>} Un tableau des conversations du propriétaire.
   */
  async getOwnerConversations(ownerId: number): Promise<ConversationSummary[]> {
    
    const otherParticipants = await this.messagesRepository
      .createQueryBuilder('message')
      .select('DISTINCT CASE WHEN message.senderId = :ownerId THEN message.receiverId ELSE message.senderId END', 'userId')
      .where('message.senderId = :ownerId OR message.receiverId = :ownerId', { ownerId })
      .getRawMany();

    if (otherParticipants.length === 0) {
      return [];
    }

    // Crée un tableau de promesses pour récupérer les détails de chaque conversation
    const conversationPromises = otherParticipants.map(async (participant) => {
      const otherUserId: number = participant.userId;
      
      try {
        const user = await this.userService.findOne(otherUserId);
        const userName = user ? `${user.firstName} ${user.lastName}` : `Utilisateur ${otherUserId}`;
        
        const latestMessage = await this.messagesRepository
          .createQueryBuilder('message')
          .where(
            '(message.senderId = :ownerId AND message.receiverId = :otherUserId) OR (message.senderId = :otherUserId AND message.receiverId = :ownerId)',
            { ownerId, otherUserId }
          )
          .orderBy('message.timestamp', 'DESC')
          .limit(1)
          .getOne();

        if (latestMessage) {
          // Si le dernier message existe, on retourne un objet ConversationSummary
          return {
            userId: otherUserId,
            userName: userName,
            lastMessage: latestMessage.content,
            lastMessageTime: latestMessage.timestamp,
            unreadCount: 0,
          };
        }
      } catch (error) {
      }
      // Si une erreur se produit ou si aucun message n'est trouvé, on retourne null
      return null;
    });

    // Attend que toutes les promesses soient résolues
    const resolvedConversations = await Promise.all(conversationPromises);

    // Filtre les valeurs null et trie le tableau final
    const filteredConversations = resolvedConversations
      .filter((conv): conv is ConversationSummary => conv !== null)
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

    return filteredConversations;
  }
}
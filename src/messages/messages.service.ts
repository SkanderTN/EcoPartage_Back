// backend/src/messages/messages.service.ts (Nouveau fichier)
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity'; // Importez l'entité depuis son nouvel emplacement

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  /**
   * @method saveMessage
   * @description Enregistre un nouveau message dans la base de données.
   * @param {string} senderId - L'ID de l'expéditeur.
   * @param {string} receiverId - L'ID du destinataire.
   * @param {string} content - Le contenu du message.
   * @returns {Promise<Message>} Le message enregistré.
   */
  async saveMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<Message> {
    const newMessage = this.messagesRepository.create({
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
    });
    const savedMessage = await this.messagesRepository.save(newMessage);
    this.logger.log(
      `Message enregistré: ${savedMessage.id} de ${senderId} à ${receiverId}`,
    );
    return savedMessage;
  }

  /**
   * @method getConversationHistory
   * @description Récupère l'historique des messages entre deux utilisateurs.
   * Les messages sont triés par horodatage.
   * @param {string} user1Id - L'ID du premier utilisateur.
   * @param {string} user2Id - L'ID du second utilisateur.
   * @returns {Promise<Message[]>} Un tableau des messages de la conversation.
   */
  async getConversationHistory(
    user1Id: string,
    user2Id: string,
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
    this.logger.log(
      `Historique de conversation récupéré entre ${user1Id} et ${user2Id}: ${messages.length} messages.`,
    );
    return messages;
  }
}

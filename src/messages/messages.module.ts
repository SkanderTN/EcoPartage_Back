// backend/src/messages/messages.module.ts (Nouveau fichier)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity'; // Importez l'entité depuis son nouvel emplacement
import { MessagesService } from './messages.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]),
  UserModule,
], // Enregistre l'entité Message avec TypeORM
  providers: [MessagesService], // Fournit le service MessagesService
  exports: [MessagesService], // Exporte le service pour qu'il puisse être utilisé par d'autres modules (ex: EventsModule)
})
export class MessagesModule {}

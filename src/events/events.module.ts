// src/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [MessagesModule],
  providers: [EventsGateway], // Déclare EventsGateway comme un fournisseur
})
export class EventsModule {}

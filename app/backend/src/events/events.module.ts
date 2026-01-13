// src/events/events.module.ts

import { Module } from '@nestjs/common';
import { EventBusModule } from '../event-bus/event-bus.module';
import { EventsGateway } from './events.gateway';
import { EventsController } from './events.controller';

@Module({
  imports: [EventBusModule],
  controllers: [EventsController],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
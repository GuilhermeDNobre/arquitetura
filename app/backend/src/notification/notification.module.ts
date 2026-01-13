// src/notification/notification.module.ts

import { Module } from '@nestjs/common';
import { EventBusModule } from '../event-bus/event-bus.module';
import { NotificationService } from './notification.service';
import { OperationalDelayHandler } from './operational-delay.handler';
import { NotificationSentHandler } from './notification-sent.handler';
import { FlightImpededHandler } from './flight-impeded.handler';
import { FlightRedirectedHandler } from './flight-redirected.handler';
import { NotificationController } from './notification.controller';

@Module({
  imports: [EventBusModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    OperationalDelayHandler,
    NotificationSentHandler,
    FlightImpededHandler,
    FlightRedirectedHandler,
  ],
  exports: [NotificationSentHandler],
})
export class NotificationModule {}

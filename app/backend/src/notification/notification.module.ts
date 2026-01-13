// src/notification/notification.module.ts

import { Module } from '@nestjs/common';
import { EventBusModule } from '../event-bus/event-bus.module';
import { NotificationService } from './notification.service';
import { OperationalDelayHandler } from './operational-delay.handler';
import { NotificationSentHandler } from './notification-sent.handler';
import { FlightImpededHandler } from './flight-impeded.handler';
import { FlightRedirectedHandler } from './flight-redirected.handler';

@Module({
  imports: [EventBusModule],
  providers: [
    NotificationService,
    OperationalDelayHandler,
    NotificationSentHandler,
    FlightImpededHandler,
    FlightRedirectedHandler,
  ],
})
export class NotificationModule {}

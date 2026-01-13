// src/notification/notification-sent.handler.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { NotificationSent } from '../events/events';

@Injectable()
export class NotificationSentHandler implements OnModuleInit {
  constructor(private readonly eventBus: EventBusService) {}

  onModuleInit() {
    this.eventBus.subscribe(
      NotificationSent.name,
      (event: NotificationSent) => {
        console.log(
          `Notification sent to ${event.recipient}: ${event.message}`,
        );
      },
    );
  }
}

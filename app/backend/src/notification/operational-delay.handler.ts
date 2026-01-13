// src/notification/operational-delay.handler.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { OperationalDelayDetected } from '../events/events';
import { NotificationService } from './notification.service';

@Injectable()
export class OperationalDelayHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationService: NotificationService,
  ) { }

  onModuleInit() {
    this.eventBus.subscribe(
      OperationalDelayDetected.name,
      async (event: OperationalDelayDetected) => {
        console.log(
          `Notification Orchestrator received: ${event.constructor.name}`,
          event,
        );
        await this.notificationService.notifyDelay(
          event.flightId,
          event.delayMinutes,
          event.reason,
        );
      },
    );
  }
}

// src/notification/flight-redirected.handler.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { FlightRedirected } from '../events/events';
import { NotificationService } from './notification.service';

@Injectable()
export class FlightRedirectedHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationService: NotificationService,
  ) { }

  onModuleInit() {
    this.eventBus.subscribe(FlightRedirected.name, async (event: FlightRedirected) => {
      console.log(`Notification Orchestrator received: ${event.constructor.name}`, event);
      await this.notificationService.notifyFlightRedirected(
        event.flightId,
        event.originalDestination,
        event.newDestination,
        event.reason,
      );
    });
  }
}
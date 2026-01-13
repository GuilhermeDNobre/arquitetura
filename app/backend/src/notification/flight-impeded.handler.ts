// src/notification/flight-impeded.handler.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { FlightImpeded } from '../events/events';
import { NotificationService } from './notification.service';

@Injectable()
export class FlightImpededHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationService: NotificationService,
  ) { }

  onModuleInit() {
    this.eventBus.subscribe(FlightImpeded.name, async (event: FlightImpeded) => {
      console.log(`Notification Orchestrator received: ${event.constructor.name}`, event);
      await this.notificationService.notifyImpededFlight(event.flightId, event.reason, event.newDepartureTime);
    });
  }
}
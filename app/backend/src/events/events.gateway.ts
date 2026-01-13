// src/events/events.gateway.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { NotificationSent } from '../events/events';

@Injectable()
export class EventsGateway implements OnModuleInit {
  private clients: Set<any> = new Set();

  constructor(private readonly eventBus: EventBusService) {}

  onModuleInit() {
    // Only listen to notification events for now
    this.eventBus.subscribe(NotificationSent.name, (event: NotificationSent) => {
      console.log('Event received:', event.constructor.name);
      // Simple logging only - no broadcasting for now
    });
  }

  addClient(client: any) {
    this.clients.add(client);
  }

  removeClient(client: any) {
    this.clients.delete(client);
  }
}
// src/notification/notification.service.ts

import { Injectable } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { NotificationSent } from '../events/events';

@Injectable()
export class NotificationService {
  constructor(private readonly eventBus: EventBusService) {}

  notifyDelay(flightId: string, delayMinutes: number, reason: string): void {
    const recipients = ['company', 'cco', 'operator'];
    const message = `Flight ${flightId} delayed by ${delayMinutes} minutes due to ${reason}`;

    recipients.forEach((recipient) => {
      const event = new NotificationSent(recipient, message);
      this.eventBus.publish(event);
    });
  }

  notifyImpededFlight(flightId: string, reason: string, newDepartureTime: Date): void {
    const recipients = ['company', 'cco', 'operator', 'authority'];
    const message = `Flight ${flightId} is impeded due to ${reason}. New departure time: ${newDepartureTime.toISOString()}`;

    recipients.forEach((recipient) => {
      const event = new NotificationSent(recipient, message);
      this.eventBus.publish(event);
    });
  }

  notifyFlightRedirected(
    flightId: string,
    originalDestination: string,
    newDestination: string,
    reason: string,
  ): void {
    const recipients = ['company', 'cco', 'operator', 'authority', 'passengers'];
    const message = `EMERGENCY: Flight ${flightId} redirected from ${originalDestination} to ${newDestination} due to ${reason}. Passengers will be informed of new arrival procedures.`;

    recipients.forEach((recipient) => {
      const event = new NotificationSent(recipient, message);
      this.eventBus.publish(event);
    });
  }
}

// src/notification/notification.service.ts

import { Injectable } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { NotificationSent } from '../events/events';

@Injectable()
export class NotificationService {
  constructor(private readonly eventBus: EventBusService) { }

  async notifyDelay(flightId: string, delayMinutes: number, reason: string): Promise<void> {
    const recipients = ['company', 'cco', 'operator'];
    const message = `Flight ${flightId} delayed by ${delayMinutes} minutes due to ${reason}`;

    await Promise.all(
      recipients.map((recipient) => {
        const event = new NotificationSent(recipient, message);
        return this.eventBus.publish(event);
      }),
    );
  }

  async notifyImpededFlight(flightId: string, reason: string, newDepartureTime: Date): Promise<void> {
    const recipients = ['company', 'cco', 'operator', 'authority'];
    const message = `Flight ${flightId} is impeded due to ${reason}. New departure time: ${newDepartureTime.toISOString()}`;

    await Promise.all(
      recipients.map((recipient) => {
        const event = new NotificationSent(recipient, message);
        return this.eventBus.publish(event);
      }),
    );
  }

  async notifyFlightRedirected(
    flightId: string,
    originalDestination: string,
    newDestination: string,
    reason: string,
  ): Promise<void> {
    const recipients = ['company', 'cco', 'operator', 'authority', 'passengers'];
    const message = `EMERGENCY: Flight ${flightId} redirected from ${originalDestination} to ${newDestination} due to ${reason}. Passengers will be informed of new arrival procedures.`;

    await Promise.all(
      recipients.map((recipient) => {
        const event = new NotificationSent(recipient, message);
        return this.eventBus.publish(event);
      }),
    );
  }
}

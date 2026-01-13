// src/notification/notification-sent.handler.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { NotificationSent } from '../events/events';

export interface StoredNotification {
  id: string;
  recipient: string;
  message: string;
  timestamp: Date;
  type: 'delay' | 'impediment' | 'redirection' | 'general';
}

@Injectable()
export class NotificationSentHandler implements OnModuleInit {
  private notifications: StoredNotification[] = [];

  constructor(private readonly eventBus: EventBusService) {}

  onModuleInit() {
    this.eventBus.subscribe(
      NotificationSent.name,
      (event: NotificationSent) => {
        const notification: StoredNotification = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          recipient: event.recipient,
          message: event.message,
          timestamp: new Date(),
          type: this.determineNotificationType(event.message),
        };

        this.notifications.unshift(notification); // Add to beginning of array

        // Keep only last 100 notifications
        if (this.notifications.length > 100) {
          this.notifications = this.notifications.slice(0, 100);
        }

        console.log(
          `Notification sent to ${event.recipient}: ${event.message}`,
        );
      },
    );
  }

  private determineNotificationType(message: string): StoredNotification['type'] {
    if (message.includes('delayed')) return 'delay';
    if (message.includes('impeded')) return 'impediment';
    if (message.includes('redirected') || message.includes('EMERGENCY')) return 'redirection';
    return 'general';
  }

  getAllNotifications(): StoredNotification[] {
    return [...this.notifications];
  }

  getNotificationsByType(type: StoredNotification['type']): StoredNotification[] {
    return this.notifications.filter(n => n.type === type);
  }

  getNotificationsByRecipient(recipient: string): StoredNotification[] {
    return this.notifications.filter(n => n.recipient === recipient);
  }
}

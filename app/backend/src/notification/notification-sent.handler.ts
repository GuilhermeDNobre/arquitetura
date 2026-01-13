// src/notification/notification-sent.handler.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { NotificationSent } from '../events/events';
import { PrismaService } from '../prisma/prisma.service';

export interface StoredNotification {
  id: string;
  recipient: string;
  message: string;
  timestamp: Date;
  type: 'delay' | 'impediment' | 'redirection' | 'general';
}

@Injectable()
export class NotificationSentHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
  ) { }

  onModuleInit() {
    this.eventBus.subscribe(
      NotificationSent.name,
      async (event: NotificationSent) => {
        const type = this.determineNotificationType(event.message);

        await this.prisma.notification.create({
          data: {
            recipient: event.recipient,
            message: event.message,
            type,
          },
        });

        console.log(
          `Notification sent to ${event.recipient}: ${event.message}`,
        );
      },
    );
  }

  private determineNotificationType(message: string): string {
    if (message.includes('delayed')) return 'delay';
    if (message.includes('impeded')) return 'impediment';
    if (message.includes('redirected') || message.includes('EMERGENCY')) return 'redirection';
    return 'general';
  }

  async getAllNotifications(): Promise<any[]> {
    return this.prisma.notification.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async getNotificationsByType(type: string): Promise<any[]> {
    return this.prisma.notification.findMany({
      where: { type },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getNotificationsByRecipient(recipient: string): Promise<any[]> {
    return this.prisma.notification.findMany({
      where: { recipient },
      orderBy: { timestamp: 'desc' },
    });
  }
}

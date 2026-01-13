// src/notification/notification.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { NotificationSentHandler, StoredNotification } from './notification-sent.handler';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationHandler: NotificationSentHandler) { }

  @Get()
  async getAllNotifications(): Promise<{ notifications: any[] }> {
    const notifications = await this.notificationHandler.getAllNotifications();
    return { notifications };
  }

  @Get('by-type')
  async getNotificationsByType(@Query('type') type: string): Promise<{ notifications: any[] }> {
    const notifications = await this.notificationHandler.getNotificationsByType(type);
    return { notifications };
  }

  @Get('by-recipient')
  async getNotificationsByRecipient(@Query('recipient') recipient: string): Promise<{ notifications: any[] }> {
    const notifications = await this.notificationHandler.getNotificationsByRecipient(recipient);
    return { notifications };
  }
}
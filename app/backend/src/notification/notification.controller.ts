// src/notification/notification.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { NotificationSentHandler, StoredNotification } from './notification-sent.handler';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationHandler: NotificationSentHandler) {}

  @Get()
  getAllNotifications(): { notifications: StoredNotification[] } {
    const notifications = this.notificationHandler.getAllNotifications();
    return { notifications };
  }

  @Get('by-type')
  getNotificationsByType(@Query('type') type: StoredNotification['type']): { notifications: StoredNotification[] } {
    const notifications = this.notificationHandler.getNotificationsByType(type);
    return { notifications };
  }

  @Get('by-recipient')
  getNotificationsByRecipient(@Query('recipient') recipient: string): { notifications: StoredNotification[] } {
    const notifications = this.notificationHandler.getNotificationsByRecipient(recipient);
    return { notifications };
  }
}
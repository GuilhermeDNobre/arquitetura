// src/events/events.controller.ts

import { Controller, Get } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsGateway: EventsGateway) {}

  @Get('status')
  getStatus() {
    return { message: 'Events service is running', timestamp: new Date() };
  }
}
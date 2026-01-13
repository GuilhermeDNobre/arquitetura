// src/event-bus/event-bus.service.ts

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventBusService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish(event: { constructor: { name: string } }): void {
    const eventName = event.constructor.name;
    console.log(`Publishing event: ${eventName}`, event);
    this.eventEmitter.emit(eventName, event);
  }

  subscribe(eventName: string, handler: (event: any) => void): void {
    this.eventEmitter.on(eventName, handler);
  }
}

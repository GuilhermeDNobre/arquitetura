// src/flight/weather-impact.handler.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { WeatherImpactDetected } from '../events/events';
import { FlightService } from './flight.service';

@Injectable()
export class WeatherImpactHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly flightService: FlightService,
  ) {}

  onModuleInit() {
    this.eventBus.subscribe(
      WeatherImpactDetected.name,
      (event: WeatherImpactDetected) => {
        console.log(
          `Flight Service received: ${event.constructor.name}`,
          event,
        );
        this.flightService.handleWeatherImpact(
          event.airportCode,
          event.impactType,
          event.severity,
        );
        this.flightService.checkImpededFlights(
          event.airportCode,
          event.impactType,
          event.severity,
          event.durationMinutes,
          event.timestamp,
          event.isCatastrophe,
        );
      },
    );
  }
}

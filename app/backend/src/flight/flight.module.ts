// src/flight/flight.module.ts

import { Module } from '@nestjs/common';
import { EventBusModule } from '../event-bus/event-bus.module';
import { AirportModule } from '../airport/airport.module';
import { FlightService } from './flight.service';
import { WeatherImpactHandler } from './weather-impact.handler';
import { FlightController } from './flight.controller';

@Module({
  imports: [EventBusModule, AirportModule],
  controllers: [FlightController],
  providers: [FlightService, WeatherImpactHandler],
})
export class FlightModule {}

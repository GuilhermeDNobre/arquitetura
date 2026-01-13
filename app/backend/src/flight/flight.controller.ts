// src/flight/flight.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { FlightService } from './flight.service';
import { CreateFlightDto } from './create-flight.dto';

@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Post()
  createFlight(@Body() createFlightDto: CreateFlightDto) {
    this.flightService.createFlight(
      createFlightDto.id,
      createFlightDto.departurePoint,
      createFlightDto.destination,
      new Date(createFlightDto.departureTime),
      new Date(createFlightDto.arrivalTime),
      createFlightDto.company,
    );
    return { message: 'Flight created successfully' };
  }
}
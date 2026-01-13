// src/flight/flight.controller.ts

import { Controller, Post, Body, Get } from '@nestjs/common';
import { FlightService } from './flight.service';
import { CreateFlightDto } from './create-flight.dto';

@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) { }

  @Post()
  async createFlight(@Body() createFlightDto: CreateFlightDto) {
    await this.flightService.createFlight(
      createFlightDto.id,
      createFlightDto.departurePoint,
      createFlightDto.destination,
      new Date(createFlightDto.departureTime),
      new Date(createFlightDto.arrivalTime),
      createFlightDto.company,
    );
    return { message: 'Flight created successfully' };
  }

  @Get()
  async getAllFlights() {
    const flights = await this.flightService.getAllFlights();
    return { flights };
  }

  @Get('impeded')
  async getImpededFlights() {
    const flights = await this.flightService.getImpededFlights();
    return { flights };
  }

  @Get('redirected')
  async getRedirectedFlights() {
    const flights = await this.flightService.getRedirectedFlights();
    return { flights };
  }

  @Get('active')
  async getActiveFlights() {
    const flights = await this.flightService.getActiveFlights();
    return { flights };
  }
}
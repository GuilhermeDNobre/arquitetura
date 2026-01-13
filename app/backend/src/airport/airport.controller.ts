// src/airport/airport.controller.ts

import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AirportService } from './airport.service';
import { CreateAirportDto } from './create-airport.dto';

@Controller('airports')
export class AirportController {
  constructor(private readonly airportService: AirportService) {}

  @Post()
  createAirport(@Body() createAirportDto: CreateAirportDto) {
    const airport = this.airportService.createAirport(
      createAirportDto.code,
      createAirportDto.name,
      createAirportDto.city,
      createAirportDto.country,
      createAirportDto.latitude,
      createAirportDto.longitude,
    );
    return { message: 'Airport created successfully', airport };
  }

  @Get()
  getAllAirports() {
    const airports = this.airportService.getAllAirports();
    return { airports };
  }

  @Get(':code')
  getAirportByCode(@Param('code') code: string) {
    const airport = this.airportService.getAirportByCode(code);
    if (!airport) {
      return { error: 'Airport not found' };
    }
    return { airport };
  }

  @Get(':code/flights')
  getFlightsByAirport(@Param('code') code: string) {
    const flights = this.airportService.getFlightsByAirport(code);
    return { airport: code, flights };
  }
}
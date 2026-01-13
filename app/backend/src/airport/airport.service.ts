// src/airport/airport.service.ts

import { Injectable } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { AirportCreated } from '../events/events';
import { PrismaService } from '../prisma/prisma.service';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  flights: any[];
}

@Injectable()
export class AirportService {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
  ) { }

  async createAirport(
    code: string,
    name: string,
    city: string,
    country: string,
    latitude?: number,
    longitude?: number,
  ): Promise<any> {
    const existing = await this.prisma.airport.findUnique({ where: { code } });
    if (existing) {
      throw new Error(`Airport with code ${code} already exists`);
    }

    const airport = await this.prisma.airport.create({
      data: {
        code,
        name,
        city,
        country,
        latitude,
        longitude,
      },
    });

    const event = new AirportCreated(code, name, city, country, latitude, longitude);
    this.eventBus.publish(event);

    return airport;
  }

  async getAllAirports(): Promise<any[]> {
    return this.prisma.airport.findMany({
      include: {
        flightsDeparture: true,
        flightsArrival: true,
      },
    });
  }

  async getAirportByCode(code: string): Promise<any | null> {
    return this.prisma.airport.findUnique({
      where: { code },
      include: {
        flightsDeparture: true,
        flightsArrival: true,
      },
    });
  }

  async addFlightToAirport(airportCode: string, flight: any): Promise<void> {
    // With Prisma and relations, we don't need to manually add flights to an array
    // The relationship is handled by foreign keys.
  }

  async getFlightsByAirport(airportCode: string): Promise<any[]> {
    const airport = await this.prisma.airport.findUnique({
      where: { code: airportCode },
      include: {
        flightsDeparture: true,
        flightsArrival: true,
      },
    });

    if (!airport) return [];
    return [...airport.flightsDeparture, ...airport.flightsArrival];
  }
}
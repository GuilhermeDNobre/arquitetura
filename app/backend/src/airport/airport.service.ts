// src/airport/airport.service.ts

import { Injectable } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { AirportCreated } from '../events/events';

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
  private airports: Map<string, Airport> = new Map();

  constructor(private readonly eventBus: EventBusService) {}

  createAirport(
    code: string,
    name: string,
    city: string,
    country: string,
    latitude?: number,
    longitude?: number,
  ): Airport {
    if (this.airports.has(code)) {
      throw new Error(`Airport with code ${code} already exists`);
    }

    const airport: Airport = {
      code,
      name,
      city,
      country,
      latitude,
      longitude,
      flights: [],
    };

    this.airports.set(code, airport);

    const event = new AirportCreated(code, name, city, country, latitude, longitude);
    this.eventBus.publish(event);

    return airport;
  }

  getAllAirports(): Airport[] {
    return Array.from(this.airports.values());
  }

  getAirportByCode(code: string): Airport | undefined {
    return this.airports.get(code);
  }

  addFlightToAirport(airportCode: string, flight: any): void {
    const airport = this.airports.get(airportCode);
    if (!airport) {
      throw new Error(`Airport with code ${airportCode} not found`);
    }

    airport.flights.push(flight);
  }

  getFlightsByAirport(airportCode: string): any[] {
    const airport = this.airports.get(airportCode);
    return airport ? airport.flights : [];
  }
}
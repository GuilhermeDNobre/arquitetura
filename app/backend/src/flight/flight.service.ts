// src/flight/flight.service.ts

import { Injectable } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { AirportService } from '../airport/airport.service';
import { PrismaService } from '../prisma/prisma.service';
import { OperationalDelayDetected, FlightCreated, FlightImpeded, FlightRedirected } from '../events/events';

@Injectable()
export class FlightService {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly airportService: AirportService,
    private readonly prisma: PrismaService,
  ) { }

  async createFlight(
    id: string,
    departurePoint: string,
    destination: string,
    departureTime: Date,
    arrivalTime: Date,
    company: string,
  ): Promise<any> {
    const flight = await this.prisma.flight.create({
      data: {
        id,
        departurePoint,
        destination,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        company,
      },
    });

    const event = new FlightCreated(id, departurePoint, destination, departureTime, arrivalTime, company);
    this.eventBus.publish(event);

    return flight;
  }

  async handleWeatherImpact(
    airportCode: string,
    impactType: string,
    severity: 'low' | 'medium' | 'high' | 'catastrophic',
  ): Promise<void> {
    let delayMinutes = 0;
    if (severity === 'high') {
      delayMinutes = 60;
    } else if (severity === 'medium') {
      delayMinutes = 30;
    }

    if (delayMinutes > 0) {
      const flightId = `FLIGHT-${airportCode}-${Date.now()}`;
      const event = new OperationalDelayDetected(
        flightId,
        delayMinutes,
        `Weather impact: ${impactType}`,
      );
      this.eventBus.publish(event);
    }
  }

  async checkImpededFlights(
    airportCode: string,
    impactType: string,
    severity: 'low' | 'medium' | 'high' | 'catastrophic',
    durationMinutes: number,
    impactTimestamp: Date,
    isCatastrophe: boolean = false,
  ): Promise<void> {
    const impactStart = new Date(impactTimestamp);
    const impactEnd = new Date(impactStart.getTime() + durationMinutes * 60000);

    const flights = await this.prisma.flight.findMany({
      where: {
        OR: [{ departurePoint: airportCode }, { destination: airportCode }],
      },
    });

    for (const flight of flights) {
      const flightStart = new Date(flight.departureTime);
      const flightEnd = new Date(flight.arrivalTime);
      const now = new Date();

      const isInFlight = now >= flightStart && now <= flightEnd;

      if (flightStart < impactEnd && flightEnd > impactStart) {
        if (isCatastrophe && isInFlight && flight.destination === airportCode) {
          await this.redirectFlight(flight, airportCode, impactType);
        } else {
          const newDepartureTime = new Date(flightStart.getTime() + 2 * 60 * 60 * 1000);

          await this.prisma.flight.update({
            where: { id: flight.id },
            data: { impeded: true },
          });

          const event = new FlightImpeded(
            flight.id,
            `Weather impact: ${impactType} at ${airportCode}`,
            newDepartureTime,
          );
          this.eventBus.publish(event);
        }
      }
    }
  }

  private async redirectFlight(flight: any, affectedAirport: string, impactType: string): Promise<void> {
    const alternativeAirport = await this.findAlternativeAirport(affectedAirport);

    if (alternativeAirport) {
      const event = new FlightRedirected(
        flight.id,
        flight.destination,
        alternativeAirport.code,
        `Catastrophic ${impactType} at ${affectedAirport} - redirected to ${alternativeAirport.code}`,
      );
      this.eventBus.publish(event);

      await this.prisma.flight.update({
        where: { id: flight.id },
        data: {
          destination: alternativeAirport.code,
          redirected: true,
          redirectionReason: `Catastrophic ${impactType} at ${affectedAirport}`,
        },
      });
    }
  }

  private async findAlternativeAirport(affectedAirportCode: string): Promise<any> {
    const availableAirports = await this.prisma.airport.findMany({
      where: { NOT: { code: affectedAirportCode } },
    });

    return availableAirports.length > 0 ? availableAirports[0] : null;
  }

  async getAllFlights(): Promise<any[]> {
    return this.prisma.flight.findMany();
  }

  async getImpededFlights(): Promise<any[]> {
    return this.prisma.flight.findMany({ where: { impeded: true } });
  }

  async getRedirectedFlights(): Promise<any[]> {
    return this.prisma.flight.findMany({ where: { redirected: true } });
  }

  async getActiveFlights(): Promise<any[]> {
    const now = new Date();
    return this.prisma.flight.findMany({
      where: {
        departureTime: { lte: now },
        arrivalTime: { gte: now },
      },
    });
  }
}

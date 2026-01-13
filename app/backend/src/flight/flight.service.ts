// src/flight/flight.service.ts

import { Injectable } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { AirportService } from '../airport/airport.service';
import { OperationalDelayDetected, FlightCreated, FlightImpeded, FlightRedirected } from '../events/events';

@Injectable()
export class FlightService {
  private flights: any[] = [];

  constructor(
    private readonly eventBus: EventBusService,
    private readonly airportService: AirportService,
  ) {}

  createFlight(
    id: string,
    departurePoint: string,
    destination: string,
    departureTime: Date,
    arrivalTime: Date,
    company: string,
  ): void {
    const flight = { id, departurePoint, destination, departureTime, arrivalTime, company };
    this.flights.push(flight);

    // Adicionar voo aos aeroportos de origem e destino
    try {
      this.airportService.addFlightToAirport(departurePoint, flight);
    } catch (error) {
      console.warn(`Warning: Could not add flight to departure airport ${departurePoint}:`, error.message);
    }

    try {
      this.airportService.addFlightToAirport(destination, flight);
    } catch (error) {
      console.warn(`Warning: Could not add flight to destination airport ${destination}:`, error.message);
    }

    const event = new FlightCreated(id, departurePoint, destination, departureTime, arrivalTime, company);
    this.eventBus.publish(event);
  }

  handleWeatherImpact(
    airportCode: string,
    impactType: string,
    severity: 'low' | 'medium' | 'high' | 'catastrophic',
  ): void {
    // Lógica simples: se severity high, delay de 60 min, etc.
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

  checkImpededFlights(
    airportCode: string,
    impactType: string,
    severity: 'low' | 'medium' | 'high' | 'catastrophic',
    durationMinutes: number,
    impactTimestamp: Date,
    isCatastrophe: boolean = false,
  ): void {
    const impactStart = new Date(impactTimestamp);
    const impactEnd = new Date(impactStart.getTime() + durationMinutes * 60000);

    for (const flight of this.flights) {
      if (flight.departurePoint === airportCode || flight.destination === airportCode) {
        const flightStart = new Date(flight.departureTime);
        const flightEnd = new Date(flight.arrivalTime);
        const now = new Date();

        // Verificar se o voo está em andamento (já decolou mas ainda não pousou)
        const isInFlight = now >= flightStart && now <= flightEnd;

        // Verificar sobreposição de períodos
        if (flightStart < impactEnd && flightEnd > impactStart) {
          if (isCatastrophe && isInFlight && flight.destination === airportCode) {
            // Voo em andamento afetado por catástrofe - redirecionar
            this.redirectFlight(flight, airportCode, impactType);
          } else {
            // Voo impedido (não decolou ainda) ou delay operacional
            const newDepartureTime = new Date(flightStart.getTime() + 2 * 60 * 60 * 1000);
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
  }

  private redirectFlight(flight: any, affectedAirport: string, impactType: string): void {
    // Encontrar aeroporto alternativo disponível
    const alternativeAirport = this.findAlternativeAirport(affectedAirport);

    if (alternativeAirport) {
      const event = new FlightRedirected(
        flight.id,
        flight.destination,
        alternativeAirport.code,
        `Catastrophic ${impactType} at ${affectedAirport} - redirected to ${alternativeAirport.code}`,
      );
      this.eventBus.publish(event);

      // Atualizar o voo com novo destino
      flight.destination = alternativeAirport.code;
      flight.redirected = true;
      flight.redirectionReason = `Catastrophic ${impactType} at ${affectedAirport}`;
    } else {
      // Sem aeroporto alternativo - forçar pouso de emergência ou algo similar
      console.warn(`No alternative airport found for flight ${flight.id} affected by ${impactType} at ${affectedAirport}`);
    }
  }

  private findAlternativeAirport(affectedAirportCode: string): any {
    // Lógica simples: encontrar aeroporto mais próximo que não seja o afetado
    // Em produção, usaria cálculo de distância baseado em coordenadas
    const availableAirports = Array.from(this.airportService.getAllAirports().values())
      .filter(airport => airport.code !== affectedAirportCode);

    // Retornar o primeiro aeroporto disponível (lógica pode ser melhorada)
    return availableAirports.length > 0 ? availableAirports[0] : null;
  }
}

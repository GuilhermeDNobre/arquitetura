// src/events/events.ts

export class WeatherImpactDetected {
  constructor(
    public readonly airportCode: string,
    public readonly impactType: string, // e.g., 'storm', 'fog', 'earthquake', 'flood'
    public readonly severity: 'low' | 'medium' | 'high' | 'catastrophic',
    public readonly durationMinutes: number,
    public readonly isCatastrophe: boolean = false,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OperationalDelayDetected {
  constructor(
    public readonly flightId: string,
    public readonly delayMinutes: number,
    public readonly reason: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class FlightCreated {
  constructor(
    public readonly id: string,
    public readonly departurePoint: string,
    public readonly destination: string,
    public readonly departureTime: Date,
    public readonly arrivalTime: Date,
    public readonly company: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class FlightImpeded {
  constructor(
    public readonly flightId: string,
    public readonly reason: string,
    public readonly newDepartureTime: Date,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class AirportCreated {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly city: string,
    public readonly country: string,
    public readonly latitude?: number,
    public readonly longitude?: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class FlightRedirected {
  constructor(
    public readonly flightId: string,
    public readonly originalDestination: string,
    public readonly newDestination: string,
    public readonly reason: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class NotificationSent {
  constructor(
    public readonly recipient: string, // 'company', 'cco', 'operator', 'authority'
    public readonly message: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

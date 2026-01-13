// src/flight/create-flight.dto.ts

export class CreateFlightDto {
  id: string;
  departurePoint: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  company: string;
}
// src/airport/create-airport.dto.ts

export class CreateAirportDto {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}
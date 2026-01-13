import { Controller, Post, Body } from '@nestjs/common';
import { EventBusService } from './event-bus/event-bus.service';
import { WeatherImpactDetected } from './events/events';

@Controller()
export class AppController {
  constructor(private readonly eventBus: EventBusService) {}

  @Post('simulate-weather-impact')
  simulateWeatherImpact(
    @Body()
    body: {
      airportCode: string;
      impactType: string;
      severity: 'low' | 'medium' | 'high' | 'catastrophic';
      durationMinutes: number;
      isCatastrophe?: boolean;
    },
  ) {
    const event = new WeatherImpactDetected(
      body.airportCode,
      body.impactType,
      body.severity,
      body.durationMinutes,
      body.isCatastrophe || body.severity === 'catastrophic',
    );
    this.eventBus.publish(event);
    return { message: 'Weather impact simulated' };
  }
}

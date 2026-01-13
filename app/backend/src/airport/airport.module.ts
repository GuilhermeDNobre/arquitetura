// src/airport/airport.module.ts

import { Module } from '@nestjs/common';
import { EventBusModule } from '../event-bus/event-bus.module';
import { AirportService } from './airport.service';
import { AirportController } from './airport.controller';

@Module({
  imports: [EventBusModule],
  controllers: [AirportController],
  providers: [AirportService],
  exports: [AirportService],
})
export class AirportModule {}
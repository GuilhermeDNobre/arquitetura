import { Module } from '@nestjs/common';
import { EventBusModule } from './event-bus/event-bus.module';
import { AirportModule } from './airport/airport.module';
import { FlightModule } from './flight/flight.module';
import { NotificationModule } from './notification/notification.module';
import { EventsModule } from './events/events.module';
import { AppController } from './app.controller';

@Module({
  imports: [EventBusModule, AirportModule, FlightModule, NotificationModule, EventsModule],
  controllers: [AppController],
})
export class AppModule {}

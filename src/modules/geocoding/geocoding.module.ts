import { Module } from '@nestjs/common';
import { GEOCODING_SERVICE } from './application/ports/geocoding.port';
import { HereGeocodingService } from './infrastructure/here-geocoding.service';

@Module({
  providers: [
    {
      provide: GEOCODING_SERVICE,
      useClass: HereGeocodingService,
    },
  ],
  exports: [GEOCODING_SERVICE],
})
export class GeocodingModule {}

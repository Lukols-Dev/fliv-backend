import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { GeocodingModule } from '../geocoding/geocoding.module';
import { PartnerPoisService } from './application/services/partner-pois.service';
import { PartnerPoisController } from './interface/rest/partner-pois.controller';

@Module({
  imports: [PrismaModule, GeocodingModule],
  providers: [PartnerPoisService],
  controllers: [PartnerPoisController],
})
export class PartnerPoisModule {}

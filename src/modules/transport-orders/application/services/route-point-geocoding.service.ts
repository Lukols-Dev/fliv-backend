import { Inject, Injectable } from '@nestjs/common';
import {
  GEOCODING_SERVICE,
  type GeocodingPort,
} from 'src/modules/geocoding/application/ports/geocoding.port';
import { TransportOrderRoutePointBehavior } from '../../domain/value-objects/transport-order-route-point-behavior.vo';
import { TransportOrderRoutePointSource } from '../../domain/value-objects/transport-order-route-point-source.vo';
import { TransportOrderRoutePointType } from '../../domain/value-objects/transport-order-route-point-type.vo';
import type { TransportOrderRoutePointInput } from '../ports/transport-order.repository.port';

export interface BuildBaseRoutePointsInput {
  fromCountry: string;
  fromAddress?: string | null;
  toCountry: string;
  toAddress?: string | null;
}

@Injectable()
export class RoutePointGeocodingService {
  constructor(
    @Inject(GEOCODING_SERVICE)
    private readonly geocoding: GeocodingPort,
  ) {}

  async buildBaseRoutePoints(
    input: BuildBaseRoutePointsInput,
  ): Promise<TransportOrderRoutePointInput[]> {
    const [loading, unloading] = await Promise.all([
      this.geocoding.geocodeAddress({
        country: input.fromCountry,
        address: input.fromAddress,
      }),
      this.geocoding.geocodeAddress({
        country: input.toCountry,
        address: input.toAddress,
      }),
    ]);

    return [
      {
        sequence: 1,
        type: TransportOrderRoutePointType.LOADING,
        behavior: TransportOrderRoutePointBehavior.STOP,
        source: TransportOrderRoutePointSource.SYSTEM,
        isManual: false,
        label: loading.title,
        address: formatAddress(input.fromCountry, input.fromAddress),
        latitude: loading.latitude,
        longitude: loading.longitude,
      },
      {
        sequence: 2,
        type: TransportOrderRoutePointType.UNLOADING,
        behavior: TransportOrderRoutePointBehavior.STOP,
        source: TransportOrderRoutePointSource.SYSTEM,
        isManual: false,
        label: unloading.title,
        address: formatAddress(input.toCountry, input.toAddress),
        latitude: unloading.latitude,
        longitude: unloading.longitude,
      },
    ];
  }
}

function formatAddress(country: string, address?: string | null): string {
  return [address, country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}

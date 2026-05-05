import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GeocodeAddressInput,
  GeocodeAddressResult,
  GeocodingPort,
} from '../../application/ports/geocoding.port';

type HereGeocodeResponse = {
  items?: Array<{
    title?: string;
    position?: {
      lat?: number;
      lng?: number;
    };
  }>;
};

@Injectable()
export class HereGeocodingService implements GeocodingPort {
  constructor(private readonly configService: ConfigService) {}

  async geocodeAddress(
    input: GeocodeAddressInput,
  ): Promise<GeocodeAddressResult> {
    const apiKey = this.configService.get<string>('here.geocodingApiKey');
    const baseUrl = this.configService.get<string>('here.geocodingBaseUrl');

    if (!apiKey || !baseUrl) {
      throw new BadRequestException('HERE geocoding is not configured');
    }

    const query = [input.address, input.country]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(', ');

    if (!query) {
      throw new BadRequestException('Address for geocoding is empty');
    }

    const url = new URL(baseUrl);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '1');
    url.searchParams.set('apiKey', apiKey);

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new BadRequestException(`Could not geocode address: ${query}`);
    }

    if (!response.ok) {
      throw new BadRequestException(`Could not geocode address: ${query}`);
    }

    const data = (await response.json()) as HereGeocodeResponse;
    const first = data.items?.[0];
    const latitude = first?.position?.lat;
    const longitude = first?.position?.lng;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new BadRequestException(`Could not geocode address: ${query}`);
    }

    return {
      latitude,
      longitude,
      title: first?.title?.trim() || query,
    };
  }
}

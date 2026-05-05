import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GeocodeAddressInput,
  GeocodeAddressResult,
  GeocodingPort,
} from '../../application/ports/geocoding.port';

type HereGeocodeResponse = {
  items?: Array<{
    id?: string;
    title?: string;
    address?: {
      label?: string;
    };
    position?: {
      lat?: number;
      lng?: number;
    };
  }>;
};

@Injectable()
export class HereGeocodingService implements GeocodingPort {
  constructor(private readonly configService: ConfigService) {}

  async searchAddress(query: string): Promise<GeocodeAddressResult[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      throw new BadRequestException('Address for geocoding is empty');
    }

    const data = await this.fetchGeocode(trimmedQuery, 5);

    const results: GeocodeAddressResult[] = [];

    for (const item of data.items ?? []) {
        const latitude = item.position?.lat;
        const longitude = item.position?.lng;

        if (
          typeof latitude !== 'number' ||
          typeof longitude !== 'number' ||
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          continue;
        }

        results.push({
          latitude,
          longitude,
          title: item.title?.trim() || trimmedQuery,
          address: item.address?.label ?? item.title ?? null,
          hereId: item.id ?? null,
        });
    }

    return results;
  }

  async geocodeAddress(
    input: GeocodeAddressInput,
  ): Promise<GeocodeAddressResult> {
    const query = [input.address, input.country]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(', ');

    if (!query) {
      throw new BadRequestException('Address for geocoding is empty');
    }

    const results = await this.searchAddress(query);
    const first = results[0];

    if (!first) {
      throw new BadRequestException(`Could not geocode address: ${query}`);
    }

    return first;
  }

  private async fetchGeocode(
    query: string,
    limit: number,
  ): Promise<HereGeocodeResponse> {
    const apiKey = this.configService.get<string>('here.geocodingApiKey');
    const baseUrl = this.configService.get<string>('here.geocodingBaseUrl');

    if (!apiKey || !baseUrl) {
      throw new BadRequestException('HERE geocoding is not configured');
    }

    const url = new URL(baseUrl);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(limit));
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

    return (await response.json()) as HereGeocodeResponse;
  }
}

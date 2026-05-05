export const GEOCODING_SERVICE = Symbol('GEOCODING_SERVICE');

export interface GeocodeAddressInput {
  country: string;
  address?: string | null;
}

export interface GeocodeAddressResult {
  latitude: number;
  longitude: number;
  title: string;
}

export interface GeocodingPort {
  geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeAddressResult>;
}

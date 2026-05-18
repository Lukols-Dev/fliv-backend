import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  GEOCODING_SERVICE,
  type GeocodeAddressResult,
  type GeocodingPort,
} from 'src/modules/geocoding/application/ports/geocoding.port';
import {
  CreatePartnerPoiDto,
  ListPartnerPoisQueryDto,
  PartnerPoiType,
  UpdatePartnerPoiDto,
} from '../dto/partner-poi.dto';

export type PartnerPoiRecord = {
  id: string;
  name: string | null;
  type: PartnerPoiType;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type PartnerPoiBbox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

@Injectable()
export class PartnerPoisService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(GEOCODING_SERVICE)
    private readonly geocoding: GeocodingPort,
  ) {}

  async list(query: ListPartnerPoisQueryDto): Promise<PartnerPoiRecord[]> {
    const bbox = parseBbox(query);
    const conditions = ['"latitude" >= $1', '"latitude" <= $2'];
    const values: unknown[] = [bbox.south, bbox.north];

    if (bbox.west <= bbox.east) {
      values.push(bbox.west, bbox.east);
      conditions.push(
        `"longitude" >= $${values.length - 1}`,
        `"longitude" <= $${values.length}`,
      );
    } else {
      values.push(bbox.west, bbox.east);
      conditions.push(
        `("longitude" >= $${values.length - 1} OR "longitude" <= $${values.length})`,
      );
    }

    if (query.isActive !== undefined) {
      values.push(query.isActive === 'true');
      conditions.push(`"isActive" = $${values.length}`);
    }

    return this.prisma.$queryRawUnsafe<PartnerPoiRecord[]>(
      `
      SELECT "id", "name", "type", "address", "latitude", "longitude", "isActive", "createdAt", "updatedAt"
      FROM "PartnerPoi"
      WHERE ${conditions.join(' AND ')}
      ORDER BY "isActive" DESC, "createdAt" DESC
    `,
      ...values,
    );
  }

  async getById(id: string): Promise<PartnerPoiRecord> {
    const [poi] = await this.prisma.$queryRawUnsafe<PartnerPoiRecord[]>(
      `
      SELECT "id", "name", "type", "address", "latitude", "longitude", "isActive", "createdAt", "updatedAt"
      FROM "PartnerPoi"
      WHERE "id" = $1
      LIMIT 1
    `,
      id,
    );

    if (!poi) {
      throw new NotFoundException('Partner POI not found');
    }

    return poi;
  }

  async create(payload: CreatePartnerPoiDto): Promise<PartnerPoiRecord> {
    const address = normalizeRequiredAddress(payload.address);
    const geocode = await this.geocodePartnerPoiAddress(address);
    const id = randomUUID();

    const [created] = await this.prisma.$queryRawUnsafe<PartnerPoiRecord[]>(
      `
      INSERT INTO "PartnerPoi" ("id", "name", "type", "address", "latitude", "longitude", "isActive", "updatedAt")
      VALUES (
        $1,
        $2,
        CAST($3 AS "PartnerPoiType"),
        $4,
        $5,
        $6,
        $7,
        NOW()
      )
      RETURNING "id", "name", "type", "address", "latitude", "longitude", "isActive", "createdAt", "updatedAt"
    `,
      id,
      normalizeOptionalString(payload.name),
      payload.type ?? PartnerPoiType.FUEL,
      address,
      roundCoordinate(geocode.latitude),
      roundCoordinate(geocode.longitude),
      payload.isActive ?? true,
    );

    return created;
  }

  async update(
    id: string,
    payload: UpdatePartnerPoiDto,
  ): Promise<PartnerPoiRecord> {
    const existing = await this.getById(id);
    let name = existing.name;
    let type = existing.type;
    let address = existing.address;
    let latitude = existing.latitude;
    let longitude = existing.longitude;
    let isActive = existing.isActive;

    if (hasOwn(payload, 'name')) {
      name = normalizeOptionalString(payload.name);
    }
    if (payload.type !== undefined) type = payload.type;
    if (payload.isActive !== undefined) isActive = payload.isActive;
    if (payload.address !== undefined) {
      address = normalizeRequiredAddress(payload.address);

      if (address !== existing.address.trim()) {
        const geocode = await this.geocodePartnerPoiAddress(address);
        latitude = roundCoordinate(geocode.latitude);
        longitude = roundCoordinate(geocode.longitude);
      }
    }

    const [updated] = await this.prisma.$queryRawUnsafe<PartnerPoiRecord[]>(
      `
      UPDATE "PartnerPoi"
      SET
        "name" = $2,
        "type" = CAST($3 AS "PartnerPoiType"),
        "address" = $4,
        "latitude" = $5,
        "longitude" = $6,
        "isActive" = $7,
        "updatedAt" = NOW()
      WHERE "id" = $1
      RETURNING "id", "name", "type", "address", "latitude", "longitude", "isActive", "createdAt", "updatedAt"
    `,
      id,
      name,
      type,
      address,
      latitude,
      longitude,
      isActive,
    );

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);

    await this.prisma.$executeRawUnsafe(
      `
      DELETE FROM "PartnerPoi"
      WHERE "id" = $1
    `,
      id,
    );
  }

  private async geocodePartnerPoiAddress(
    address: string,
  ): Promise<GeocodeAddressResult> {
    const results = await this.geocoding.searchAddress(address);
    const first = results[0];

    if (!first) {
      throw new BadRequestException(`Could not geocode address: ${address}`);
    }

    return first;
  }
}

function parseBbox(query: ListPartnerPoisQueryDto): PartnerPoiBbox {
  const { north, south, east, west } = query;
  const values = [north, south, east, west];

  if (values.some((value) => value === undefined)) {
    throw new BadRequestException('Bounding box is required');
  }

  if (
    !isFiniteNumber(north) ||
    !isFiniteNumber(south) ||
    !isFiniteNumber(east) ||
    !isFiniteNumber(west)
  ) {
    throw new BadRequestException('Bounding box is invalid');
  }

  if (north < south) {
    throw new BadRequestException('Bounding box latitude range is invalid');
  }

  return { north, south, east, west };
}

function normalizeRequiredAddress(address: string): string {
  const trimmed = address.trim();

  if (!trimmed) {
    throw new BadRequestException('Partner POI address is required');
  }

  return trimmed;
}

function normalizeOptionalString(value: string | null | undefined) {
  return value?.trim() || null;
}

function roundCoordinate(value: number): number {
  return Number(value.toFixed(7));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasOwn<T extends object, K extends PropertyKey>(
  object: T,
  key: K,
): object is T & Record<K, unknown> {
  return Object.hasOwn(object, key);
}

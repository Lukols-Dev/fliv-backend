import {
  BadRequestException,
  ConflictException,
  GoneException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  Prisma,
  TransportOrderRoutePointBehavior as PrismaRoutePointBehavior,
  TransportOrderRoutePointSource as PrismaRoutePointSource,
  TransportOrderRoutePointType as PrismaRoutePointType,
} from 'generated/prisma/client';
import {
  GEOCODING_SERVICE,
  type GeocodeAddressResult,
  type GeocodingPort,
} from 'src/modules/geocoding/application/ports/geocoding.port';
import {
  CalculateTransportOrderRouteDto,
  RoutePointDraftDto,
  RoutingProfileDto,
  SaveTransportOrderRouteDto,
  VehicleSpecDto,
} from '../dto/transport-order-route-editor.dto';
import { TransportOrderRoutePointBehavior } from '../../domain/value-objects/transport-order-route-point-behavior.vo';
import { TransportOrderRoutePointSource } from '../../domain/value-objects/transport-order-route-point-source.vo';
import { TransportOrderRoutePointType } from '../../domain/value-objects/transport-order-route-point-type.vo';

const PREVIEW_TTL_MINUTES = 60;

type NormalizedRoutePoint = {
  sequence: number;
  type: TransportOrderRoutePointType;
  behavior: TransportOrderRoutePointBehavior;
  source: TransportOrderRoutePointSource;
  isManual: boolean;
  label: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
};

type CalculationInput = {
  routePoints: Array<{
    sequence: number;
    behavior: TransportOrderRoutePointBehavior;
    latitude: number;
    longitude: number;
  }>;
  routingProfile: RoutingProfileDto;
  vehicleSpec: VehicleSpecDto | null;
};

type CalculatedRoute = {
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
  calculatedAt: string;
};

type HereRouteResponse = {
  routes?: Array<{
    sections?: Array<{
      polyline?: string;
      summary?: {
        length?: number;
        duration?: number;
      };
    }>;
  }>;
};

@Injectable()
export class TransportOrderRouteEditorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(GEOCODING_SERVICE)
    private readonly geocoding: GeocodingPort,
  ) {}

  async getRoute(orderId: string) {
    const order = await this.prisma.transportOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        routePoints: { orderBy: { sequence: 'asc' } },
        routePlan: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    const routePlan = order.routePlan
      ? {
          routingProfile: order.routePlan.routingProfile,
          vehicleSpec: order.routePlan.vehicleSpec,
          distanceMeters: order.routePlan.distanceMeters,
          durationSeconds: order.routePlan.durationSeconds,
          polyline: order.routePlan.polyline,
          calculationHash: order.routePlan.calculationHash,
          calculatedAt: order.routePlan.calculatedAt,
        }
      : null;

    return {
      routePoints: order.routePoints.map((point) => ({
        id: point.id,
        sequence: point.sequence,
        type: point.type,
        behavior: point.behavior,
        source: point.source,
        isManual: point.isManual,
        label: point.label,
        address: point.address,
        latitude: point.latitude,
        longitude: point.longitude,
      })),
      routePlan,
      routingProfile:
        (routePlan?.routingProfile as RoutingProfileDto | undefined) ??
        defaultRoutingProfile(),
      vehicleSpec:
        (routePlan?.vehicleSpec as VehicleSpecDto | null | undefined) ??
        defaultVehicleSpec(),
    };
  }

  async geocode(query: string): Promise<GeocodeAddressResult[]> {
    return this.geocoding.searchAddress(query);
  }

  async calculate(orderId: string, payload: CalculateTransportOrderRouteDto) {
    await this.ensureOrderExists(orderId);

    const normalizedPoints = normalizeRoutePoints(payload.routePoints);
    if (normalizedPoints.length < 2) {
      throw new BadRequestException('At least two route points are required');
    }

    const routingProfile = normalizeRoutingProfile(payload.routingProfile);
    const vehicleSpec = normalizeVehicleSpecForTransport(
      routingProfile,
      payload.vehicleSpec ?? null,
    );
    const calculationInput = buildCalculationInput(
      normalizedPoints,
      routingProfile,
      vehicleSpec,
    );
    const calculationHash = calculateHash(calculationInput);
    const calculatedRoute = await this.calculateHereRoute(
      calculationInput,
      routingProfile,
      vehicleSpec,
    );
    const expiresAt = new Date(Date.now() + PREVIEW_TTL_MINUTES * 60 * 1000);

    const preview = await this.prisma.transportOrderRoutePreview.create({
      data: {
        transportOrderId: orderId,
        calculationHash,
        calculationInput: calculationInput as unknown as Prisma.InputJsonValue,
        calculatedRoute: calculatedRoute as unknown as Prisma.InputJsonValue,
        expiresAt,
      },
    });

    return {
      routePreviewId: preview.id,
      calculationHash,
      ...calculatedRoute,
    };
  }

  async save(orderId: string, payload: SaveTransportOrderRouteDto) {
    const normalizedPoints = normalizeRoutePoints(payload.routePoints);
    if (normalizedPoints.length < 2) {
      throw new BadRequestException('At least two route points are required');
    }

    const routingProfile = normalizeRoutingProfile(payload.routingProfile);
    const vehicleSpec = normalizeVehicleSpecForTransport(
      routingProfile,
      payload.vehicleSpec ?? null,
    );
    const calculationInput = buildCalculationInput(
      normalizedPoints,
      routingProfile,
      vehicleSpec,
    );
    const calculationHash = calculateHash(calculationInput);

    if (calculationHash !== payload.calculationHash) {
      throw recalculationRequired();
    }

    return this.prisma.$transaction(async (tx) => {
      const preview = await tx.transportOrderRoutePreview.findUnique({
        where: { id: payload.routePreviewId },
      });

      if (!preview || preview.transportOrderId !== orderId) {
        throw routePreviewNotFound();
      }

      if (preview.expiresAt.getTime() <= Date.now()) {
        throw routePreviewExpired();
      }

      if (preview.calculationHash !== calculationHash) {
        throw recalculationRequired();
      }

      const calculatedRoute = parseCalculatedRoute(preview.calculatedRoute);

      await tx.transportOrderRoutePoint.deleteMany({
        where: { transportOrderId: orderId },
      });

      await tx.transportOrderRoutePoint.createMany({
        data: normalizedPoints.map((point) => ({
          transportOrderId: orderId,
          sequence: point.sequence,
          type: point.type as PrismaRoutePointType,
          behavior: point.behavior as PrismaRoutePointBehavior,
          source: point.source as PrismaRoutePointSource,
          isManual: point.isManual,
          label: point.label,
          address: point.address,
          latitude: point.latitude,
          longitude: point.longitude,
        })),
      });

      const routePlan = await tx.transportOrderRoutePlan.upsert({
        where: { transportOrderId: orderId },
        create: {
          transportOrderId: orderId,
          routingProfile: routingProfile as unknown as Prisma.InputJsonValue,
          vehicleSpec: vehicleSpec as unknown as Prisma.InputJsonValue,
          distanceMeters: calculatedRoute.distanceMeters,
          durationSeconds: calculatedRoute.durationSeconds,
          polyline: calculatedRoute.polyline,
          calculationHash,
          calculatedAt: new Date(calculatedRoute.calculatedAt),
        },
        update: {
          routingProfile: routingProfile as unknown as Prisma.InputJsonValue,
          vehicleSpec: vehicleSpec as unknown as Prisma.InputJsonValue,
          distanceMeters: calculatedRoute.distanceMeters,
          durationSeconds: calculatedRoute.durationSeconds,
          polyline: calculatedRoute.polyline,
          calculationHash,
          calculatedAt: new Date(calculatedRoute.calculatedAt),
        },
      });

      await tx.transportOrderRoutePreview.delete({
        where: { id: preview.id },
      });

      return {
        success: true,
        routePlan: {
          routingProfile: routePlan.routingProfile,
          vehicleSpec: routePlan.vehicleSpec,
          distanceMeters: routePlan.distanceMeters,
          durationSeconds: routePlan.durationSeconds,
          polyline: routePlan.polyline,
          calculationHash: routePlan.calculationHash,
          calculatedAt: routePlan.calculatedAt,
        },
      };
    });
  }

  private async ensureOrderExists(orderId: string) {
    const order = await this.prisma.transportOrder.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) {
      throw new NotFoundException('Transport order not found');
    }
  }

  private async calculateHereRoute(
    calculationInput: CalculationInput,
    routingProfile: RoutingProfileDto,
    vehicleSpec: VehicleSpecDto | null,
  ): Promise<CalculatedRoute> {
    const apiKey = this.configService.get<string>('here.routingApiKey');
    const baseUrl = this.configService.get<string>('here.routingBaseUrl');

    if (!apiKey || !baseUrl) {
      throw new BadRequestException('HERE routing is not configured');
    }

    const routePoints = calculationInput.routePoints;
    const origin = routePoints[0];
    const destination = routePoints[routePoints.length - 1];
    const url = new URL(baseUrl);
    url.searchParams.set('transportMode', routingProfile.transportMode);
    url.searchParams.set('routingMode', routingProfile.routingMode);
    url.searchParams.set('origin', formatHerePoint(origin));
    url.searchParams.set('destination', formatHerePoint(destination));
    url.searchParams.set('return', 'polyline,summary');
    url.searchParams.set('apiKey', apiKey);

    routePoints.slice(1, -1).forEach((point) => {
      url.searchParams.append('via', formatHereViaPoint(point));
    });

    if (routingProfile.trafficMode === 'disabled') {
      url.searchParams.set('traffic[mode]', 'disabled');
    }

    const avoidFeatures = buildAvoidFeatures(routingProfile);
    if (avoidFeatures.length) {
      url.searchParams.set('avoid[features]', avoidFeatures.join(','));
    }

    if (routingProfile.transportMode === 'truck') {
      applyVehicleSpec(url, vehicleSpec);
    }

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new BadRequestException('Could not calculate route');
    }

    if (!response.ok) {
      throw new BadRequestException('Could not calculate route');
    }

    const data = (await response.json()) as HereRouteResponse;
    const sections = data.routes?.[0]?.sections ?? [];
    const polylines = sections
      .map((section) => section.polyline)
      .filter((polyline): polyline is string => Boolean(polyline));

    if (!sections.length || !polylines.length) {
      throw new BadRequestException('Could not calculate route');
    }

    const distanceMeters = sections.reduce(
      (sum, section) => sum + (section.summary?.length ?? 0),
      0,
    );
    const durationSeconds = sections.reduce(
      (sum, section) => sum + (section.summary?.duration ?? 0),
      0,
    );

    if (distanceMeters <= 0 || durationSeconds <= 0) {
      throw new BadRequestException('Could not calculate route');
    }

    return {
      polyline: polylines.join('|'),
      distanceMeters,
      durationSeconds,
      calculatedAt: new Date().toISOString(),
    };
  }
}

function normalizeRoutePoints(
  routePoints: RoutePointDraftDto[],
): NormalizedRoutePoint[] {
  return routePoints
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((point, index) => ({
      sequence: index + 1,
      type: point.type,
      behavior: point.behavior ?? TransportOrderRoutePointBehavior.STOP,
      source: point.source ?? TransportOrderRoutePointSource.DISPATCHER,
      isManual: point.isManual ?? true,
      label: point.label?.trim() || null,
      address: point.address?.trim() || null,
      latitude: roundCoordinate(point.latitude),
      longitude: roundCoordinate(point.longitude),
    }));
}

function normalizeRoutingProfile(
  routingProfile: RoutingProfileDto | undefined,
): RoutingProfileDto {
  return {
    transportMode: routingProfile?.transportMode ?? 'truck',
    routingMode: routingProfile?.routingMode ?? 'fast',
    trafficMode: routingProfile?.trafficMode ?? 'default',
    avoidTolls: routingProfile?.avoidTolls ?? false,
    avoidFerries: routingProfile?.avoidFerries ?? false,
    avoidMotorways: routingProfile?.avoidMotorways ?? false,
  };
}

function normalizeVehicleSpecForTransport(
  routingProfile: RoutingProfileDto,
  vehicleSpec: VehicleSpecDto | null | undefined,
): VehicleSpecDto | null {
  return routingProfile.transportMode === 'truck'
    ? normalizeVehicleSpec(vehicleSpec)
    : null;
}

function normalizeVehicleSpec(
  vehicleSpec: VehicleSpecDto | null | undefined,
): VehicleSpecDto | null {
  if (!vehicleSpec) {
    return defaultVehicleSpec();
  }

  return {
    heightCm: nullableInteger(vehicleSpec.heightCm),
    widthCm: nullableInteger(vehicleSpec.widthCm),
    lengthCm: nullableInteger(vehicleSpec.lengthCm),
    currentWeightKg: nullableInteger(vehicleSpec.currentWeightKg),
    grossWeightKg: nullableInteger(vehicleSpec.grossWeightKg),
    weightPerAxleKg: nullableInteger(vehicleSpec.weightPerAxleKg),
    axleCount: nullableInteger(vehicleSpec.axleCount),
    trailerCount: nullableInteger(vehicleSpec.trailerCount ?? 1),
    hazardousGoods: vehicleSpec.hazardousGoods?.length
      ? vehicleSpec.hazardousGoods.slice().sort()
      : null,
  };
}

function defaultRoutingProfile(): RoutingProfileDto {
  return {
    transportMode: 'truck',
    routingMode: 'fast',
    trafficMode: 'default',
    avoidTolls: false,
    avoidFerries: false,
    avoidMotorways: false,
  };
}

function defaultVehicleSpec(): VehicleSpecDto {
  return {
    heightCm: null,
    widthCm: null,
    lengthCm: null,
    currentWeightKg: null,
    grossWeightKg: null,
    weightPerAxleKg: null,
    axleCount: null,
    trailerCount: 1,
    hazardousGoods: null,
  };
}

function buildCalculationInput(
  routePoints: NormalizedRoutePoint[],
  routingProfile: RoutingProfileDto,
  vehicleSpec: VehicleSpecDto | null,
): CalculationInput {
  return {
    routePoints: routePoints.map((point) => ({
      sequence: point.sequence,
      behavior: point.behavior,
      latitude: point.latitude,
      longitude: point.longitude,
    })),
    routingProfile,
    vehicleSpec,
  };
}

function calculateHash(input: CalculationInput): string {
  return createHash('sha256').update(stableStringify(input)).digest('hex');
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortStable(value));
}

function sortStable(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortStable);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortStable((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
}

function parseCalculatedRoute(value: Prisma.JsonValue): CalculatedRoute {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw routePreviewNotFound();
  }

  const route = value as Record<string, unknown>;
  if (
    typeof route.polyline !== 'string' ||
    typeof route.distanceMeters !== 'number' ||
    typeof route.durationSeconds !== 'number' ||
    typeof route.calculatedAt !== 'string'
  ) {
    throw routePreviewNotFound();
  }

  return {
    polyline: route.polyline,
    distanceMeters: route.distanceMeters,
    durationSeconds: route.durationSeconds,
    calculatedAt: route.calculatedAt,
  };
}

function buildAvoidFeatures(routingProfile: RoutingProfileDto): string[] {
  const features: string[] = [];
  if (routingProfile.avoidTolls) features.push('tollRoad');
  if (routingProfile.avoidFerries) features.push('ferry');
  if (routingProfile.avoidMotorways) features.push('controlledAccessHighway');
  return features;
}

function applyVehicleSpec(url: URL, vehicleSpec: VehicleSpecDto | null) {
  if (!vehicleSpec) return;

  setNumberParam(url, 'vehicle[height]', vehicleSpec.heightCm);
  setNumberParam(url, 'vehicle[width]', vehicleSpec.widthCm);
  setNumberParam(url, 'vehicle[length]', vehicleSpec.lengthCm);
  setNumberParam(url, 'vehicle[currentWeight]', vehicleSpec.currentWeightKg);
  setNumberParam(url, 'vehicle[grossWeight]', vehicleSpec.grossWeightKg);
  setNumberParam(url, 'vehicle[weightPerAxle]', vehicleSpec.weightPerAxleKg);
  setNumberParam(url, 'vehicle[axleCount]', vehicleSpec.axleCount);
  setNumberParam(url, 'vehicle[trailerCount]', vehicleSpec.trailerCount);

  if (vehicleSpec.hazardousGoods?.length) {
    url.searchParams.set(
      'vehicle[shippedHazardousGoods]',
      vehicleSpec.hazardousGoods.join(','),
    );
  }
}

function setNumberParam(url: URL, key: string, value?: number | null) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    url.searchParams.set(key, String(value));
  }
}

function formatHerePoint(point: { latitude: number; longitude: number }) {
  return `${point.latitude},${point.longitude}`;
}

function formatHereViaPoint(point: {
  latitude: number;
  longitude: number;
  behavior: TransportOrderRoutePointBehavior;
}) {
  const base = formatHerePoint(point);
  return point.behavior === TransportOrderRoutePointBehavior.PASS_THROUGH
    ? `${base}!passThrough=true`
    : base;
}

function roundCoordinate(value: number): number {
  return Number(value.toFixed(7));
}

function nullableInteger(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.trunc(value)
    : null;
}

function routePreviewNotFound(): HttpException {
  return new NotFoundException({
    code: 'ROUTE_PREVIEW_NOT_FOUND',
    message: 'Route preview not found',
  });
}

function routePreviewExpired(): HttpException {
  return new GoneException({
    code: 'ROUTE_PREVIEW_EXPIRED',
    message: 'Route preview expired',
  });
}

function recalculationRequired(): HttpException {
  return new ConflictException({
    code: 'ROUTE_RECALCULATION_REQUIRED',
    message: 'Route recalculation required',
  });
}

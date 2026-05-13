import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DriverLiveLocation,
  DriverLocationSource,
  TransportOrderStatus,
} from 'generated/prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UpsertDriverLiveLocationDto } from '../dto/driver-live-location.dto';

const MAX_LOCATION_AGE_MS = 10_000;

const ACTIVE_TRANSPORT_ORDER_STATUSES: TransportOrderStatus[] = [
  TransportOrderStatus.ACCEPTED,
  TransportOrderStatus.IN_PROGRESS,
  TransportOrderStatus.LOADING,
  TransportOrderStatus.UNLOADING,
  TransportOrderStatus.PAUSED,
];

export type DriverLiveLocationResponse = {
  driverId: string;
  transportOrderId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  speedMetersPerSecond: number | null;
  bearingDegrees: number | null;
  remainingDistanceMeters: number | null;
  traveledDistanceMeters: number | null;
  remainingDurationSeconds: number | null;
  recordedAt: Date;
  updatedAt: Date;
  source: DriverLocationSource;
};

@Injectable()
export class DriverLiveLocationService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertForDriver(input: {
    currentUserId: string;
    transportOrderId: string;
    payload: UpsertDriverLiveLocationDto;
  }): Promise<DriverLiveLocationResponse> {
    const order = await this.prisma.transportOrder.findUnique({
      where: { id: input.transportOrderId },
      select: {
        id: true,
        assignedDriverUserId: true,
        status: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    if (order.assignedDriverUserId !== input.currentUserId) {
      throw new ForbiddenException(
        'You cannot send location for this transport order',
      );
    }

    if (!ACTIVE_TRANSPORT_ORDER_STATUSES.includes(order.status)) {
      throw new ConflictException('This transport order is not active');
    }

    const recordedAt = this.parseRecordedAt(input.payload.recordedAt);
    if (Date.now() - recordedAt.getTime() > MAX_LOCATION_AGE_MS) {
      throw new BadRequestException('Recorded location is too old');
    }

    if (input.payload.source !== DriverLocationSource.HERE_SDK) {
      throw new BadRequestException('Unsupported driver location source');
    }

    const saved = await this.prisma.driverLiveLocation.upsert({
      where: {
        transportOrderId_driverId: {
          transportOrderId: order.id,
          driverId: input.currentUserId,
        },
      },
      create: {
        driverId: input.currentUserId,
        transportOrderId: order.id,
        latitude: input.payload.latitude,
        longitude: input.payload.longitude,
        accuracyMeters: input.payload.accuracyMeters ?? null,
        speedMps: input.payload.speedMetersPerSecond ?? null,
        bearingDegrees: input.payload.bearingDegrees ?? null,
        remainingDistanceMeters: input.payload.remainingDistanceMeters ?? null,
        traveledDistanceMeters: input.payload.traveledDistanceMeters ?? null,
        remainingDurationSeconds: input.payload.remainingDurationSeconds ?? null,
        recordedAt,
        source: DriverLocationSource.HERE_SDK,
      },
      update: {
        latitude: input.payload.latitude,
        longitude: input.payload.longitude,
        accuracyMeters: input.payload.accuracyMeters ?? null,
        speedMps: input.payload.speedMetersPerSecond ?? null,
        bearingDegrees: input.payload.bearingDegrees ?? null,
        remainingDistanceMeters: input.payload.remainingDistanceMeters ?? null,
        traveledDistanceMeters: input.payload.traveledDistanceMeters ?? null,
        remainingDurationSeconds: input.payload.remainingDurationSeconds ?? null,
        recordedAt,
        source: DriverLocationSource.HERE_SDK,
      },
    });

    return this.toResponse(saved);
  }

  async getForDispatcher(
    transportOrderId: string,
  ): Promise<DriverLiveLocationResponse | null> {
    const order = await this.prisma.transportOrder.findUnique({
      where: { id: transportOrderId },
      select: { id: true },
    });

    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    const location = await this.prisma.driverLiveLocation.findFirst({
      where: { transportOrderId: order.id },
      orderBy: { updatedAt: 'desc' },
    });

    return location ? this.toResponse(location) : null;
  }

  private parseRecordedAt(value: string): Date {
    const recordedAt = new Date(value);
    if (Number.isNaN(recordedAt.getTime())) {
      throw new BadRequestException('recordedAt must be a valid ISO date');
    }

    return recordedAt;
  }

  private toResponse(
    location: DriverLiveLocation,
  ): DriverLiveLocationResponse {
    return {
      driverId: location.driverId,
      transportOrderId: location.transportOrderId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracyMeters: location.accuracyMeters,
      speedMetersPerSecond: location.speedMps,
      bearingDegrees: location.bearingDegrees,
      remainingDistanceMeters: location.remainingDistanceMeters,
      traveledDistanceMeters: location.traveledDistanceMeters,
      remainingDurationSeconds: location.remainingDurationSeconds,
      recordedAt: location.recordedAt,
      updatedAt: location.updatedAt,
      source: location.source,
    };
  }
}

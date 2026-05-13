import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  DriverLocationSource,
  TransportOrderStatus,
} from 'generated/prisma/client';
import type { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { UpsertDriverLiveLocationDto } from '../dto/driver-live-location.dto';
import { DriverLiveLocationService } from './driver-live-location.service';

describe('DriverLiveLocationService', () => {
  const now = new Date('2026-05-12T10:00:00.000Z');

  function createRecord(overrides = {}) {
    return {
      id: 'loc-1',
      driverId: 'driver-1',
      transportOrderId: 'order-1',
      latitude: 52.2297,
      longitude: 21.0122,
      accuracyMeters: 12,
      speedMps: 0,
      bearingDegrees: 91,
      recordedAt: now,
      source: DriverLocationSource.HERE_SDK,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  function createService() {
    const findUnique = jest.fn();
    const upsert = jest.fn();
    const findFirst = jest.fn();
    const prisma = {
      transportOrder: { findUnique },
      driverLiveLocation: { upsert, findFirst },
    };

    return {
      findUnique,
      upsert,
      findFirst,
      service: new DriverLiveLocationService(
        prisma as unknown as PrismaService,
      ),
    };
  }

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('validates payload coordinate and numeric ranges', async () => {
    const dto = plainToInstance(UpsertDriverLiveLocationDto, {
      latitude: 91,
      longitude: -181,
      accuracyMeters: -1,
      speedMetersPerSecond: -1,
      bearingDegrees: 361,
      recordedAt: 'not-a-date',
      source: DriverLocationSource.HERE_SDK,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining([
        'latitude',
        'longitude',
        'accuracyMeters',
        'speedMetersPerSecond',
        'bearingDegrees',
        'recordedAt',
      ]),
    );
  });

  it('rejects a HERE location older than ten seconds', async () => {
    const { findUnique, upsert, service } = createService();
    findUnique.mockResolvedValue({
      id: 'order-1',
      assignedDriverUserId: 'driver-1',
      status: TransportOrderStatus.ACCEPTED,
    });

    await expect(
      service.upsertForDriver({
        currentUserId: 'driver-1',
        transportOrderId: 'order-1',
        payload: {
          latitude: 52.2297,
          longitude: 21.0122,
          recordedAt: new Date(now.getTime() - 10_001).toISOString(),
          source: DriverLocationSource.HERE_SDK,
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects a driver who is not assigned to the order', async () => {
    const { findUnique, service } = createService();
    findUnique.mockResolvedValue({
      id: 'order-1',
      assignedDriverUserId: 'other-driver',
      status: TransportOrderStatus.ACCEPTED,
    });

    await expect(
      service.upsertForDriver({
        currentUserId: 'driver-1',
        transportOrderId: 'order-1',
        payload: {
          latitude: 52.2297,
          longitude: 21.0122,
          recordedAt: now.toISOString(),
          source: DriverLocationSource.HERE_SDK,
        },
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects inactive transport order statuses', async () => {
    const { findUnique, service } = createService();
    findUnique.mockResolvedValue({
      id: 'order-1',
      assignedDriverUserId: 'driver-1',
      status: TransportOrderStatus.COMPLETED,
    });

    await expect(
      service.upsertForDriver({
        currentUserId: 'driver-1',
        transportOrderId: 'order-1',
        payload: {
          latitude: 52.2297,
          longitude: 21.0122,
          recordedAt: now.toISOString(),
          source: DriverLocationSource.HERE_SDK,
        },
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('upserts one latest location row per order and driver', async () => {
    const { findUnique, upsert, service } = createService();
    findUnique.mockResolvedValue({
      id: 'order-1',
      assignedDriverUserId: 'driver-1',
      status: TransportOrderStatus.IN_PROGRESS,
    });
    upsert.mockResolvedValue(createRecord());

    const result = await service.upsertForDriver({
      currentUserId: 'driver-1',
      transportOrderId: 'order-1',
      payload: {
        latitude: 52.2297,
        longitude: 21.0122,
        accuracyMeters: 12,
        speedMetersPerSecond: 0,
        bearingDegrees: 91,
        recordedAt: now.toISOString(),
        source: DriverLocationSource.HERE_SDK,
      },
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          transportOrderId_driverId: {
            transportOrderId: 'order-1',
            driverId: 'driver-1',
          },
        },
        update: expect.objectContaining({
          latitude: 52.2297,
          longitude: 21.0122,
          speedMps: 0,
          source: DriverLocationSource.HERE_SDK,
        }),
      }),
    );
    expect(result.speedMetersPerSecond).toBe(0);
  });

  it('overwrites the same latest location row on repeated updates', async () => {
    const { findUnique, upsert, service } = createService();
    findUnique.mockResolvedValue({
      id: 'order-1',
      assignedDriverUserId: 'driver-1',
      status: TransportOrderStatus.IN_PROGRESS,
    });
    upsert
      .mockResolvedValueOnce(createRecord({ latitude: 52.1, longitude: 21.1 }))
      .mockResolvedValueOnce(createRecord({ latitude: 52.2, longitude: 21.2 }));

    await service.upsertForDriver({
      currentUserId: 'driver-1',
      transportOrderId: 'order-1',
      payload: {
        latitude: 52.1,
        longitude: 21.1,
        recordedAt: now.toISOString(),
        source: DriverLocationSource.HERE_SDK,
      },
    });
    const result = await service.upsertForDriver({
      currentUserId: 'driver-1',
      transportOrderId: 'order-1',
      payload: {
        latitude: 52.2,
        longitude: 21.2,
        recordedAt: now.toISOString(),
        source: DriverLocationSource.HERE_SDK,
      },
    });

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          transportOrderId_driverId: {
            transportOrderId: 'order-1',
            driverId: 'driver-1',
          },
        },
        update: expect.objectContaining({
          latitude: 52.2,
          longitude: 21.2,
        }),
      }),
    );
    expect(result.latitude).toBe(52.2);
    expect(result.longitude).toBe(21.2);
  });

  it('returns null for dispatcher when no location exists', async () => {
    const { findUnique, findFirst, service } = createService();
    findUnique.mockResolvedValue({ id: 'order-1' });
    findFirst.mockResolvedValue(null);

    await expect(service.getForDispatcher('order-1')).resolves.toBeNull();
  });
});

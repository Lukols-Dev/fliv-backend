import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { PartnerPoisService } from './partner-pois.service';
import type { GeocodingPort } from 'src/modules/geocoding/application/ports/geocoding.port';
import { PartnerPoiType } from '../dto/partner-poi.dto';

describe('PartnerPoisService', () => {
  const now = new Date('2026-05-11T10:00:00.000Z');

  function createService() {
    const queryRawUnsafe = jest.fn();
    const executeRawUnsafe = jest.fn();
    const searchAddress: jest.MockedFunction<GeocodingPort['searchAddress']> =
      jest.fn();
    const geocodeAddress: jest.MockedFunction<GeocodingPort['geocodeAddress']> =
      jest.fn();
    const prisma = {
      $queryRawUnsafe: queryRawUnsafe,
      $executeRawUnsafe: executeRawUnsafe,
    };
    const geocoding: GeocodingPort = {
      searchAddress,
      geocodeAddress,
    };

    return {
      prisma,
      geocoding,
      queryRawUnsafe,
      executeRawUnsafe,
      searchAddress,
      geocodeAddress,
      service: new PartnerPoisService(
        prisma as unknown as PrismaService,
        geocoding,
      ),
    };
  }

  it('geocodes address when creating a partner POI', async () => {
    const { queryRawUnsafe, searchAddress, service } = createService();
    searchAddress.mockResolvedValue([
      {
        title: 'Station',
        address: 'Station address',
        latitude: 52.123456789,
        longitude: 21.987654321,
      },
    ]);
    queryRawUnsafe.mockResolvedValue([
      {
        id: 'poi-1',
        name: 'Partner',
        type: PartnerPoiType.FUEL,
        address: 'Warszawa, Polska',
        latitude: 52.1234568,
        longitude: 21.9876543,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await service.create({
      name: ' Partner ',
      type: PartnerPoiType.FUEL,
      address: '  Warszawa, Polska  ',
    });

    expect(searchAddress).toHaveBeenCalledWith('Warszawa, Polska');
    expect(queryRawUnsafe).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('poi-1');
  });

  it('does not geocode when patch address is unchanged after trimming', async () => {
    const { queryRawUnsafe, searchAddress, service } = createService();
    queryRawUnsafe
      .mockResolvedValueOnce([
        {
          id: 'poi-1',
          name: 'Old',
          type: PartnerPoiType.FUEL,
          address: 'Warszawa, Polska',
          latitude: 52,
          longitude: 21,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'poi-1',
          name: 'Old',
          type: PartnerPoiType.FUEL,
          address: 'Warszawa, Polska',
          latitude: 52,
          longitude: 21,
          isActive: false,
          createdAt: now,
          updatedAt: now,
        },
      ]);

    await service.update('poi-1', {
      address: '  Warszawa, Polska  ',
      isActive: false,
    });

    expect(searchAddress).not.toHaveBeenCalled();
    expect(queryRawUnsafe).toHaveBeenCalledTimes(2);
  });

  it('geocodes when patch address changes', async () => {
    const { queryRawUnsafe, searchAddress, service } = createService();
    queryRawUnsafe
      .mockResolvedValueOnce([
        {
          id: 'poi-1',
          name: 'Old',
          type: PartnerPoiType.FUEL,
          address: 'Warszawa, Polska',
          latitude: 52,
          longitude: 21,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'poi-1',
          name: 'Old',
          type: PartnerPoiType.PARKING,
          address: 'Poznan, Polska',
          latitude: 52.4,
          longitude: 16.9,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    searchAddress.mockResolvedValue([
      {
        title: 'Poznan',
        latitude: 52.4,
        longitude: 16.9,
      },
    ]);
    await service.update('poi-1', {
      type: PartnerPoiType.PARKING,
      address: 'Poznan, Polska',
    });

    expect(searchAddress).toHaveBeenCalledWith('Poznan, Polska');
    expect(queryRawUnsafe).toHaveBeenCalledTimes(2);
  });

  it('filters list by required bbox and active flag', async () => {
    const { queryRawUnsafe, service } = createService();
    queryRawUnsafe.mockResolvedValue([]);

    await service.list({
      north: 53,
      south: 52,
      west: 20,
      east: 22,
      isActive: 'true',
    });

    expect(queryRawUnsafe).toHaveBeenCalledTimes(1);
  });

  it('rejects list without complete bbox', async () => {
    const { service } = createService();

    await expect(service.list({ north: 53, south: 52 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

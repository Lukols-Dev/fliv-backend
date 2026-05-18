import { TransportOrderRoutePointBehavior } from '../value-objects/transport-order-route-point-behavior.vo';
import { TransportOrderRoutePointSource } from '../value-objects/transport-order-route-point-source.vo';
import { TransportOrderRoutePointType } from '../value-objects/transport-order-route-point-type.vo';

export class TransportOrderRoutePoint {
  constructor(
    public readonly id: string,
    public readonly sequence: number,
    public readonly type: TransportOrderRoutePointType,
    public readonly behavior: TransportOrderRoutePointBehavior,
    public readonly source: TransportOrderRoutePointSource,
    public readonly isManual: boolean,
    public readonly label: string | null,
    public readonly address: string | null,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly arrivedAt: Date | null = null,
    public readonly arrivalLatitude: number | null = null,
    public readonly arrivalLongitude: number | null = null,
  ) {}
}

import { TransportOrderId } from '../value-objects/transport-order-id.vo';
import { TransportOrderStatus } from '../value-objects/transport-order-status.vo';
import { TransportOrderDocument } from './transport-order-document.entity';
import { TransportOrderEvent } from './transport-order-event.entity';
import { TransportOrderRoutePlan } from './transport-order-route-plan.entity';
import { TransportOrderRoutePoint } from './transport-order-route-point.entity';

export class TransportOrder {
  constructor(
    public readonly id: TransportOrderId,
    public ztNumber: string,
    public pwNumber: string | null,
    public status: TransportOrderStatus,
    public timelinessStatus: string | null,

    public vehiclePlate: string,
    public trailerPlate: string | null,

    public driverFirstName: string,
    public driverLastName: string,
    public driverPhone: string,

    public clientName: string,
    public contractNumber: string | null,
    public payerName: string | null,
    public payerVatId: string | null,
    public payerEmail: string | null,

    public fromCountry: string,
    public fromAddress: string | null,
    public toCountry: string,
    public toAddress: string | null,
    public cargoWeightKg: number | null,
    public loadingDate: Date | null,
    public loadingTime: string | null,
    public cargoDescription: string | null,
    public temperatureSensitive: boolean,
    public notes: string | null,

    public createdByUserId: string | null,
    public assignedDriverUserId: string | null,
    public createdAt: Date,
    public updatedAt: Date,

    public documents: TransportOrderDocument[] = [],
    public events: TransportOrderEvent[] = [],
    public routePoints: TransportOrderRoutePoint[] = [],
    public routePlan: TransportOrderRoutePlan | null = null,
  ) {}
}

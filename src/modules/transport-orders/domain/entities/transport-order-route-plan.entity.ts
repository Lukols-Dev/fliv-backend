export class TransportOrderRoutePlan {
  constructor(
    public readonly routingProfile: unknown,
    public readonly vehicleSpec: unknown,
    public readonly distanceMeters: number,
    public readonly durationSeconds: number,
    public readonly polyline: string,
    public readonly calculationHash: string,
    public readonly calculatedAt: Date,
  ) {}
}

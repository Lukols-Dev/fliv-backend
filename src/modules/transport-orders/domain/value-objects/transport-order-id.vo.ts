export class TransportOrderId {
  constructor(public readonly value: string) {
    if (!value) {
      throw new Error('Transport order id cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }
}

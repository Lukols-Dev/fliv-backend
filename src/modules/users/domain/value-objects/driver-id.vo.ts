export class DriverId {
  constructor(public readonly value: string) {
    if (!value) {
      throw new Error('Identyfikator kierowcy nie może być pusty');
    }
  }

  toString(): string {
    return this.value;
  }
}

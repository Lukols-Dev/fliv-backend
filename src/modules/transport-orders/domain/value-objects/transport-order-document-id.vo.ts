export class TransportOrderDocumentId {
  constructor(public readonly value: string) {
    if (!value) {
      throw new Error('Transport order document id cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }
}

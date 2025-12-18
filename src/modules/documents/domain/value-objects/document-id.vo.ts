export class DocumentId {
  constructor(public readonly value: string) {
    if (!value) {
      throw new Error('Document id cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }
}

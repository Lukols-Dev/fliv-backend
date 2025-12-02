export class UserId {
  constructor(public readonly value: string) {
    if (!value) {
      throw new Error('Identyfikator użytkownika nie może być pusty');
    }
  }

  toString(): string {
    return this.value;
  }
}

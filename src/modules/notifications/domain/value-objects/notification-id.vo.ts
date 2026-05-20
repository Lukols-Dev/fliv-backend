export class NotificationId {
  constructor(public readonly value: string) {
    if (!value) {
      throw new Error('Notification id cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }
}

import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UserId } from '../../domain/value-objects/user-id.vo';

export class BetterAuthUserMapper {
  static sessionToUserId(session: UserSession): UserId {
    return new UserId(session.user.id);
  }
}

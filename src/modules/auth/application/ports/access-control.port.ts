import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import type { RoleKey } from 'src/shared/constants/roles.constants';

export const ACCESS_CONTROL_PORT = Symbol('ACCESS_CONTROL_PORT');

export interface AccessControlPort {
  getUserRoles(userId: UserId): Promise<RoleKey[]>;

  userHasAnyRole(userId: UserId, roles: RoleKey[]): Promise<boolean>;
}

import type { RoleKey } from 'src/shared/constants/roles.constants';
import { UserId } from '../../domain/value-objects/user-id.vo';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface RoleRepositoryPort {
  ensureRoleExists(key: RoleKey): Promise<void>;
  assignRoleToUser(userId: UserId, key: RoleKey): Promise<void>;
  userHasRole(userId: UserId, key: RoleKey): Promise<boolean>;
  removeRoleFromUser(userId: UserId, roleKey: RoleKey): Promise<void>;
}

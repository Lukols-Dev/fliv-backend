import { RoleKey } from 'src/shared/constants/roles.constants';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface RoleRepositoryPort {
  ensureRoleExists(key: RoleKey): Promise<void>;
  assignRoleToUser(userId: string, key: RoleKey): Promise<void>;
  userHasRole(userId: string, key: RoleKey): Promise<boolean>;
}

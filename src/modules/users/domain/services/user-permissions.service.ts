import { RoleKey } from 'src/shared/constants/roles.constants';

export class UserPermissionService {
  hasRole(roles: RoleKey[], required: RoleKey): boolean {
    return roles.includes(required);
  }

  hasAnyRole(roles: RoleKey[], requiredRoles: RoleKey[]): boolean {
    return requiredRoles.some((role) => roles.includes(role));
  }
}

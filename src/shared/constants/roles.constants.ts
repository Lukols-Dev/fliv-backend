export const ROLE_DRIVER = 'DRIVER' as const;
export const ROLE_DISPATCHER = 'DISPATCHER' as const;
export const ROLE_ACCOUNTANT = 'ACCOUNTANT' as const;
export const ROLE_SPEDITOR = 'SPEDITOR' as const;
export const ROLE_ADMIN = 'ADMIN' as const;

export const CORE_ROLES = [
  ROLE_DRIVER,
  ROLE_DISPATCHER,
  ROLE_ACCOUNTANT,
  ROLE_SPEDITOR,
  ROLE_ADMIN,
] as const;

export type RoleKey = (typeof CORE_ROLES)[number];

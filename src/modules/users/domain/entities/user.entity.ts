import { RoleKey } from 'src/shared/constants/roles.constants';

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public firstName: string | null,
    public lastName: string | null,
    public phone: string | null,
    public avatarUrl: string | null,
    public avatarStorageKey: string | null,
    public isActive: boolean,
    public isAgreedToTerms: boolean,
    public isAgreedToPrivacyPolicy: boolean,
    public roles: RoleKey[] = [],
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}

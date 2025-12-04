import { User } from '../../domain/entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type UserId = string;
export type Email = string;

export interface CreateUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserInput {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  avatarStorageKey?: string | null;
  isActive?: boolean;
  isAgreedToTerms?: boolean;
  isAgreedToPrivacyPolicy?: boolean;
  lastLoggedInAt?: Date;
}

export interface UserRepositoryPort {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;

  create(data: CreateUserInput): Promise<User>;

  update(id: UserId, data: UpdateUserInput): Promise<User>;

  /**
   * Returns the user along with their roles (and DriverProfile if applicable),
   * in order to calculate permissions.
   */
  findWithRolesById(id: UserId): Promise<User | null>;
}

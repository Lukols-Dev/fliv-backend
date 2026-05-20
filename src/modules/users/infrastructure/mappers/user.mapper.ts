import { User } from '../../domain/entities/user.entity';
import { RoleKey } from 'src/shared/constants/roles.constants';
import {
  User as PrismaUser,
  Role as PrismaRole,
} from 'generated/prisma/client';

type PrismaUserWithRoles = PrismaUser & {
  roles?: {
    role: PrismaRole;
  }[];
};

export class UserMapper {
  static toDomain(prismaUser: PrismaUserWithRoles): User {
    const roles: RoleKey[] =
      prismaUser.roles?.map((ur) => ur.role.key as RoleKey) ?? [];

    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.firstName ?? null,
      prismaUser.lastName ?? null,
      prismaUser.phone ?? null,
      prismaUser.avatarUrl ?? null,
      prismaUser.avatarStorageKey ?? null,
      prismaUser.isActive,
      prismaUser.isAgreedToTerms,
      prismaUser.isAgreedToPrivacyPolicy,
      roles,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }
}

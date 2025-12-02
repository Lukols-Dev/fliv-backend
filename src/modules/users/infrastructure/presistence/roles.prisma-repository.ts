import { Injectable } from '@nestjs/common';
import { RoleRepositoryPort } from '../../application/ports/role.repository.port';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { RoleKey } from 'src/shared/constants/roles.constants';

@Injectable()
export class RolesPrismaRepository implements RoleRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async ensureRoleExists(key: RoleKey): Promise<void> {
    await this.prisma.role.upsert({
      where: { key },
      update: {},
      create: {
        key,
      },
    });
  }

  async assignRoleToUser(userId: string, key: RoleKey): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { key },
    });

    if (!role) {
      throw new Error(`Role ${key} does not exist`);
    }

    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId,
        roleId: role.id,
      },
    });
  }

  async userHasRole(userId: string, key: RoleKey): Promise<boolean> {
    const result = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role: {
          key,
        },
      },
    });

    return !!result;
  }
}

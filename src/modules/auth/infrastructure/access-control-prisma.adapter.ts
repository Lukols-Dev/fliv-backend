import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { AccessControlPort } from '../application/ports/access-control.port';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import type { RoleKey } from 'src/shared/constants/roles.constants';

@Injectable()
export class AccessControlPrismaAdapter implements AccessControlPort {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRoles(userId: UserId): Promise<RoleKey[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { userId: userId.value },
      include: { role: true },
    });

    return rows.map((row) => row.role.key as RoleKey);
  }

  async userHasAnyRole(userId: UserId, roles: RoleKey[]): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return roles.some((r) => userRoles.includes(r));
  }
}

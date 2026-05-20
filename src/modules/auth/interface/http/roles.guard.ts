import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { UserSession } from '@thallesp/nestjs-better-auth';

import { ROLES_KEY } from './roles.decorator';
import {
  ACCESS_CONTROL_PORT,
  type AccessControlPort,
} from '../../application/ports/access-control.port';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import type { RoleKey } from 'src/shared/constants/roles.constants';

type RequestWithSession = Request & { session?: UserSession };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(ACCESS_CONTROL_PORT)
    private readonly accessControl: AccessControlPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleKey[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const session = request.session;

    if (!session) {
      throw new UnauthorizedException('Not authenticated');
    }

    const userId = new UserId(session.user.id);

    const hasRole = await this.accessControl.userHasAnyRole(
      userId,
      requiredRoles,
    );

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}

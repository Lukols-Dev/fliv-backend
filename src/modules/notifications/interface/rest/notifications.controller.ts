import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Session,
} from '@nestjs/common';
import { AuthGuard, Session as BetterSession } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/config/app.routes';
import { ListUserNotificationsUseCase } from '../../application/use-cases/list-user-notifications.usecase';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-notification-read.usecase';
import { DeleteNotificationUseCase } from '../../application/use-cases/delete-notification.usecase';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller(routesV1.notifications.root)
export class NotificationsController {
  constructor(
    private readonly listUseCase: ListUserNotificationsUseCase,
    private readonly markReadUseCase: MarkNotificationReadUseCase,
    private readonly deleteUseCase: DeleteNotificationUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  async list(@Session() session: UserSession) {
    const notifications = await this.listUseCase.execute({
      currentUserId: session.user.id,
    });

    return notifications.map((n) => ({
      id: n.id.value,
      userId: n.userId,
      type: n.type,
      message: n.message,
      createdAt: n.createdAt,
      readAt: n.readAt,
    }));
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Session() session: UserSession, @Param('id') id: string) {
    const notification = await this.markReadUseCase.execute({
      currentUserId: session.user.id,
      notificationId: id,
    });

    return {
      id: notification.id.value,
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async delete(@Session() session: UserSession, @Param('id') id: string) {
    await this.deleteUseCase.execute({
      currentUserId: session.user.id,
      notificationId: id,
    });

    return { success: true };
  }
}


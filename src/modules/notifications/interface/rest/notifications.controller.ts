import { Controller, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/config/app.routes';
import { ListUserNotificationsUseCase } from '../../application/use-cases/list-user-notifications.usecase';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-notification-read.usecase';
import { DeleteNotificationUseCase } from '../../application/use-cases/delete-notification.usecase';
import { ClearAllNotificationsUseCase } from '../../application/use-cases/clear-all-notifications.usecase';
import { Roles } from 'src/modules/auth/interface/http/roles.decorator';
import { ROLE_DISPATCHER } from 'src/shared/constants/roles.constants';

@ApiTags('Notifications')
@ApiBearerAuth()
@Roles(ROLE_DISPATCHER)
@Controller(routesV1.notifications.root)
export class NotificationsController {
  constructor(
    private readonly listUseCase: ListUserNotificationsUseCase,
    private readonly markReadUseCase: MarkNotificationReadUseCase,
    private readonly deleteUseCase: DeleteNotificationUseCase,
    private readonly clearAllUseCase: ClearAllNotificationsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  async list(
    @Session() session: UserSession,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? Number(page) : 1;
    const limitNumber = limit ? Number(limit) : 10;

    const requestedPage =
      Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
    const safeLimit =
      Number.isFinite(limitNumber) && limitNumber > 0 ? limitNumber : 10;

    let result = await this.listUseCase.execute({
      currentUserId: session.user.id,
      page: requestedPage,
      limit: safeLimit,
    });

    if (result.totalPages > 0 && result.page > result.totalPages) {
      result = await this.listUseCase.execute({
        currentUserId: session.user.id,
        page: result.totalPages,
        limit: safeLimit,
      });
    }

    return {
      page: result.page,
      limit: result.limit,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      items: result.items.map((n) => ({
        id: n.id.value,
        userId: n.userId,
        type: n.type,
        data: n.data,
        createdAt: n.createdAt,
        readAt: n.readAt,
      })),
    };
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
      data: notification.data,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all notifications for current user' })
  async clearAll(@Session() session: UserSession) {
    await this.clearAllUseCase.execute({
      currentUserId: session.user.id,
    });

    return { success: true };
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

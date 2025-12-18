import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

import { ActivateUserDto } from '../../application/dto/activate-user.dto';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user.usecase';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterUserProfileDto } from '../../application/dto/register-user-profile.dto';
import { RegisterUserProfileUseCase } from '../../application/use-cases/register-user-profile.usecase';
import { UpdateUserProfileDto } from '../../application/dto/update-user-profile.dto';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.usecase';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.usecase';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.usecase';
import { Roles } from 'src/modules/auth/interface/http/roles.decorator';
import { ROLE_ADMIN } from 'src/shared/constants/roles.constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadUserAvatarUseCase } from '../../application/use-cases/upload-user-avatar.usecase';
import type { LocalFile } from 'src/modules/documents/application/ports/file-storage.port';

const MAX_AVATAR_FILE_SIZE_MB = 10;
const MAX_AVATAR_FILE_SIZE_BYTES = MAX_AVATAR_FILE_SIZE_MB * 1024 * 1024;

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly registerUserProfileUseCase: RegisterUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly uploadUserAvatarUseCase: UploadUserAvatarUseCase,
  ) {}

  @Post('profile')
  async completeProfile(
    @Session() session: UserSession,
    @Body() dto: RegisterUserProfileDto,
  ): Promise<{ success: boolean }> {
    await this.registerUserProfileUseCase.execute({
      currentUserId: session.user.id,
      payload: dto,
    });

    return { success: true };
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Partial update of user profile (firstName, lastName, phone, consents).',
  })
  async updateProfile(
    @Session() session: UserSession,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<{ success: boolean }> {
    await this.updateUserProfileUseCase.execute({
      currentUserId: session.user.id,
      payload: dto,
    });

    return { success: true };
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload current user avatar (Cloudinary)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_AVATAR_FILE_SIZE_BYTES },
    }),
  )
  async uploadAvatar(
    @Session() session: UserSession,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpe?g|png|webp)$/i })
        .addMaxSizeValidator({ maxSize: MAX_AVATAR_FILE_SIZE_BYTES })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    if (!file?.buffer) {
      throw new BadRequestException('File buffer is missing');
    }

    const localFile: LocalFile = {
      buffer: file.buffer,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      originalFilename: file.originalname,
    };

    const result = await this.uploadUserAvatarUseCase.execute({
      currentUserId: session.user.id,
      file: localFile,
    });

    return { avatarUrl: result.avatarUrl };
  }

  @Post('activate')
  @Roles(ROLE_ADMIN)
  async activateUser(
    @Body() dto: ActivateUserDto,
  ): Promise<{ success: boolean }> {
    await this.activateUserUseCase.execute(dto);
    return { success: true };
  }

  @Get('me')
  async me(@Session() session: UserSession) {
    const user = await this.getCurrentUserUseCase.execute(session.user.id);
    return user;
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Delete current user account (self)',
    description: 'Deletes the authenticated user account.',
  })
  async deleteMe(
    @Session() session: UserSession,
  ): Promise<{ success: boolean }> {
    await this.deleteUserUseCase.execute(session.user.id);
    return { success: true };
  }

  @Delete(':id')
  @Roles(ROLE_ADMIN)
  @ApiOperation({
    summary: 'Delete user by id (admin)',
    description:
      'Deletes user by id. Should be protected by admin roles guard.',
  })
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.deleteUserUseCase.execute(id);

    return { success: true };
  }
}

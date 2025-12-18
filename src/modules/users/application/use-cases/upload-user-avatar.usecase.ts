import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
  type LocalFile,
} from 'src/modules/documents/application/ports/file-storage.port';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import { UserId } from '../../domain/value-objects/user-id.vo';

export interface UploadUserAvatarInput {
  currentUserId: string;
  file: LocalFile;
}

@Injectable()
export class UploadUserAvatarUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(input: UploadUserAvatarInput): Promise<{
    avatarUrl: string;
    avatarStorageKey: string;
  }> {
    const userId = new UserId(input.currentUserId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is not active');
    }

    // Best-effort cleanup of the previous avatar. We don't want to block upload if cleanup fails.
    if (user.avatarStorageKey) {
      try {
        await this.fileStorage.deleteFile(user.avatarStorageKey);
      } catch {
        // ignore
      }
    }

    const uploaded = await this.fileStorage.uploadFile({
      localFile: input.file,
    });

    await this.userRepository.update(userId, {
      avatarUrl: uploaded.url,
      avatarStorageKey: uploaded.storageKey,
    });

    return {
      avatarUrl: uploaded.url,
      avatarStorageKey: uploaded.storageKey,
    };
  }
}



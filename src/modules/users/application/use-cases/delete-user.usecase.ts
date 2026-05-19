import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
} from 'src/modules/documents/application/ports/file-storage.port';
import { UserId } from '../../domain/value-objects/user-id.vo';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(rawUserId: string): Promise<void> {
    const userId = new UserId(rawUserId);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (user.avatarStorageKey) {
      try {
        await this.fileStorage.deleteFile(user.avatarStorageKey);
      } catch {
        // best-effort: don't block account deletion if Cloudinary is unavailable
      }
    }

    await this.userRepository.delete(userId);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  CreateUserInput,
  UpdateUserInput,
  UserRepositoryPort,
} from '../../application/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserId } from '../../domain/value-objects/user-id.vo';

@Injectable()
export class UsersPrismaRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.value },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async create(data: CreateUserInput): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        phone: data.phone ?? null,
        isActive: data.isActive ?? false,
      },
    });

    return UserMapper.toDomain(created);
  }

  async update(id: UserId, data: UpdateUserInput): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: id.value },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        avatarStorageKey: data.avatarStorageKey,
        isActive: data.isActive,
        isAgreedToTerms: data.isAgreedToTerms,
        isAgreedToPrivacyPolicy: data.isAgreedToPrivacyPolicy,
      },
    });

    return UserMapper.toDomain(updated);
  }

  async findWithRolesById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.value },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.value },
    });
  }
}

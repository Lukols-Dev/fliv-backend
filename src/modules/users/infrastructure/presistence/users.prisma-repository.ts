import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  CreateUserInput,
  UpdateUserInput,
  UserRepositoryPort,
} from '../../application/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UsersPrismaRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
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

  async findWithRolesById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
}

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    const databaseUrl = configService.get<string>('database.url');

    if (!databaseUrl) {
      // hard fail on startup — better than random P1001 errors at runtime
      throw new Error('Database URL is not configured under "database.url"');
    }

    const adapter = new PrismaPg({
      connectionString: databaseUrl,
      // optionally max pool size, ssl, etc. if needed
    });

    super({ adapter });
  }

  /**
   * Connect to DB on application startup,
   * so connection errors appear immediately (rather than during a request).
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Gracefully close the connection when NestJS process shuts down
   * (works together with app.enableShutdownHooks()).
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

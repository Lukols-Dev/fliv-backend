import { Module } from '@nestjs/common';
import { LoggerModule } from 'pino-nestjs';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),
        transport: !isProd
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                singleLine: false,
              },
            }
          : undefined,
      },
    }),
  ],
})
export class LoggingModule {}

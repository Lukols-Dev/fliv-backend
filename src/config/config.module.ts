import { Module } from '@nestjs/common';
import configuration from './configuration';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnv } from './env.valitation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
      //TODO: Add env file path for test, dev, prod, envFilePath: ['.env.development.local', '.env'],
    }),
  ],
})
export class ConfigModule {}

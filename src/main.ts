import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'pino-nestjs';

async function bootstrap() {
  // 1. Tworzymy aplikację z bufferLogs, żeby logi sprzed startu też poszły przez Pino
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 2. Bierzemy ConfigService i wyciągamy sekcję "app"
  const configService = app.get(ConfigService);
  const appConfig = configService.get<{
    port: number;
    apiPrefix: string;
    apiVersion: string;
  }>('app');

  if (!appConfig) {
    throw new Error('App config is missing (check configuration.ts)');
  }

  // using Pino logger
  app.useLogger(app.get(Logger));

  // global prefix: /api/v1
  app.setGlobalPrefix(`${appConfig.apiPrefix}/${appConfig.apiVersion}`);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FLIV API')
    .setDescription('FLIV Transport Management System API')
    .setVersion(appConfig.apiVersion)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // useGlobalPrefix: true => Swagger UI /api/v1/docs
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableShutdownHooks();

  await app.listen(appConfig.port);
}
bootstrap();

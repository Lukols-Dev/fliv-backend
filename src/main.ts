import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'pino-nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false, //BetterAuth need this to work
  });

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
  const globalPrefix = `${appConfig.apiPrefix}/${appConfig.apiVersion}`;
  app.setGlobalPrefix(globalPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FLIV API')
    .setDescription('FLIV Transport Management System API')
    .setVersion(appConfig.apiVersion)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // useGlobalPrefix: true => Swagger UI /api/v1/docs or /docs-json
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // CORS configuration
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
  });

  app.enableShutdownHooks();

  await app.listen(appConfig.port);
}
bootstrap();

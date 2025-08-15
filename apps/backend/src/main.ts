import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API Documentation
  const config = new DocumentBuilder()
    .setTitle('Remodely CRM API')
    .setDescription('Enterprise CRM API for construction companies')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3001;
  try {
    await app.listen(port);
  } catch (err: any) {
    if (err?.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} already in use; assuming server already running. Skipping second bootstrap.`);
      return; // Do not log normal startup banners twice
    }
    throw err;
  }
  logger.log(`Backend server running on http://localhost:${port}`);
  logger.log(`API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();

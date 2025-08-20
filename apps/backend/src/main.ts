import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Raw body for Stripe webhook signature verification
  app.use('/billing/webhook', express.raw({ type: 'application/json' }));

  // ---- CORS CONFIGURATION ----
  // Accept comma-separated list in CORS_ORIGINS (preferred) or fallback to FRONTEND_URL.
  // Example: CORS_ORIGINS="https://crm-h137.onrender.com,https://staging-crm.onrender.com,http://localhost:3000"
  const explicitOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  const fallbackOrigin = process.env.FRONTEND_URL?.trim();
  const allowedOrigins = Array.from(new Set([
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    ...(explicitOrigins.length ? explicitOrigins : []),
    ...(fallbackOrigin ? [fallbackOrigin] : []),
  ])).filter(Boolean);

  const corsLogger = new Logger('CORS');
  corsLogger.log(`Allowed Origins: ${allowedOrigins.join(', ') || '(none)'}`);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser / same-origin (no origin header) requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
  corsLogger.warn(`Blocked CORS origin: ${origin}`);
      return callback(new Error('CORS blocked')); // Will omit CORS headers
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept',
    maxAge: 86400,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global structured exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

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

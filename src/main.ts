import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './logger/winston-logger';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { SuccessInterceptor } from './utils/interceptors/success.intercepter';
import helmet from 'helmet';
import * as expressBasicAuth from 'express-basic-auth';
import { RolesGuard } from './utils/guards/custom-role.guard';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger
    })
  });

  app.useGlobalGuards(new RolesGuard(new Reflector()));

  Sentry.init({
    dsn: process.env.SENTRY_DNS,
    release: process.env.SENTRY_RELEASE,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0, 
    profilesSampleRate: 1.0
  });

  app.setGlobalPrefix(process.env.URL_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      whitelist: true
    }),
  );

  app.useGlobalInterceptors(new SuccessInterceptor());

  app.use([process.env.SWAGGER_URL], expressBasicAuth({
    challenge: true,
    users: {
      [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD
    }
  }));

  const config = new DocumentBuilder()
    .setTitle('bebesnap API document')
    .setDescription('bebesnap API document')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header'
      },
      'JWT Auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(process.env.SWAGGER_URL, app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha'
    }
  });

  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [];
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
    credentials: true
  });

  app.use(helmet.hidePoweredBy());

  await app.listen(process.env.PORT, '0.0.0.0');
}
bootstrap();

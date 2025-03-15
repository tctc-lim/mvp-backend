import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Enable CORS
  app.enableCors();

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Church KYC API')
    .setDescription('API documentation for Church KYC Management System')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Members', 'Member management endpoints')
    .addTag('Followup', 'Follow-up management endpoints')
    .addTag('Health', 'Health check endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Custom Swagger UI options
  SwaggerModule.setup('api-docs', app, document, {
    customJs: '/swagger-ui-bundle.js',
    customCssUrl: '/swagger-ui.css',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();

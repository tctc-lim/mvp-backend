import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Church KYC API')
    .setDescription('API documentation for Church KYC Management System')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Members', 'Member management endpoints')
    .addTag('Followup', 'Follow-up management endpoints')
    .addTag('Health', 'Health check endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header'
      },
      'access-token'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Custom Swagger UI options
  const customOptions = {
    customSiteTitle: 'Church KYC API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
    },
  };

  SwaggerModule.setup('api-docs', app, document, customOptions);

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();

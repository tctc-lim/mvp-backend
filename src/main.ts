import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config } from 'dotenv';

// Load the appropriate .env file based on NODE_ENV
config({
  path: process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development'
});

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

  // Serve static files from public directory
  app.useStaticAssets('public');

  // Update Swagger setup with reliable CDN links
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Church KYC API Documentation',
    customfavIcon: 'https://raw.githubusercontent.com/swagger-api/swagger-ui/master/dist/favicon-32x32.png',
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js'
    ],
    customJsStr: `
      window.onload = function() {
        window.ui = SwaggerUIBundle({
          url: '/api-docs-json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "BaseLayout",
          persistAuthorization: true,
          docExpansion: 'list',
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          defaultModelRendering: 'model'
        });
      }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      tryItOutEnabled: true
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();

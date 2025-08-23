import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SQLF API')
    .setDescription('API para análise e explicação de código usando IA')
    .setVersion('1.0.0')
    .addTag('Health', 'Endpoints de status da API')
    .addTag('Code Explanation', 'Endpoints para explicação de código')
    .addTag('Code Analysis', 'Endpoints para análise de código')
    .setContact(
      'SQLF API Team',
      'https://github.com/lsboissard/sqlf-api',
      'contato@sqlf-api.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'SQLF API Documentation',
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

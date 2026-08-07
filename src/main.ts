import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors()

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FeastIQ API')
    .setDescription('The FeastIQ API (The Intelligent Restaurant & Food Ordering Platform)')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

    await app.listen(process.env.PORT ?? 5000);

}
bootstrap();



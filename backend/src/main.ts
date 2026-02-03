import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes( new ValidationPipe({
    transform: true,
    whitelist: true,
  }))

  app.use(helmet());
  app.enableCors();

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();

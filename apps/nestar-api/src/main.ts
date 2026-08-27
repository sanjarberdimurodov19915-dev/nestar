import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.intercepter';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // global integratsiya
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors({origin: true, credentials: true});

  app.use(graphqlUploadExpress({maxFileSize: 15000000, maxFiles: 10})); // 15MB, 10 files
  app.use('/uploads', express.static('./uploads')); // serve static files from the 'upload' directory

  await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();

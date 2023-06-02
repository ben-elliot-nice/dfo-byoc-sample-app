import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const server = express();
  server.locals.ucfirst = function (value) {
    const string = String(value);
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    {
      logger: ['debug', 'error', 'log', 'verbose', 'warn'],
    },
  );
  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>('PORT');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('pug');
  app.use(cookieParser(['Io3jJVXXNscm3ZfJDh3A8Pn9li90HLyT']));

  await app.listen(port, () => {
    Logger.log(`Listening on port: ${port}`);
  });
}
bootstrap();

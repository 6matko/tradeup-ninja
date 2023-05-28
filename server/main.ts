const appInsights = require('applicationinsights');
appInsights.start();
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
}

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(compression());

  // Note that applying helmet as global or registering it must come before other calls to app.use()
  // or setup functions that may call app.use()). This is due to the way the underlying platform (i.e., Express or Fastify)
  // works, where the order that middleware/routes are defined matters.
  // If you use middleware like helmet or cors after you define a route, then that middleware will not apply to that route,
  /// it will only apply to middleware defined after the route.
  app.use(
    helmet({
      // We have to disable this because otherwise we can't render (display) images from Steam
      contentSecurityPolicy: false,
    })
  );

  app.use(cookieParser());

  // As explained on the csurf middleware page, the csurf module requires either session middleware
  // or a cookie-parser to be initialized first. Please see that documentation for further instructions.
  // NOTE: We need to say that we want to use cookie instead of session. For this reason it should be after cookieParser()
  app.use(csurf({ cookie: true }));

  app.enableCors({
    methods: 'GET',
    maxAge: 3600,
  });

  // Setting global fillter to catch every exception in app.
  // Src: https://docs.nestjs.com/techniques/logger
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  console.log(process.env.PORT);
  await app.listen(process.env.PORT || 4200);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  bootstrap().catch((err) => console.error(err));
}

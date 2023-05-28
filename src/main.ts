/*
 * Entry point of the application.
 * Only platform bootstrapping code should be here.
 * For app-specific initialization, use `app/app.component.ts`.
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '@env/environment';
import { AppModule } from './app/app.module';
import { hmrBootstrap } from './hmr';


if (environment.production) {
  enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (environment.hmr) {
  hmrBootstrap(module, bootstrap);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap().catch((err) => console.error(err));
  });
}

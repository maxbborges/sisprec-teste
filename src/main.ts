import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  // Remove os console.log() da exibição em produção
  if (window) {
    window.console.log = () => { };
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

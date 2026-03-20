import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Registra locale espanol para pipes de moneda, fecha y numero.
registerLocaleData(localeEs);

// Punto de arranque principal de la aplicacion Angular.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

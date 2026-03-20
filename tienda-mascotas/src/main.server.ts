import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { App } from './app/app';
import { config } from './app/app.config.server';

// En SSR tambien se debe registrar el locale para pipes como currency.
registerLocaleData(localeEs);

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, config, context);

export default bootstrap;

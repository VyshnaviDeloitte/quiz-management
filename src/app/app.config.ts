import { ApplicationConfig, provideZoneChangeDetection ,importProvidersFrom} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(),
    provideRouter(routes),
    importProvidersFrom(BrowserModule), // Ensure BrowserModule is also imported
    importProvidersFrom(HttpClientModule),
  ]
};
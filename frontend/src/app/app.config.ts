import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAuth0 } from '@auth0/auth0-angular';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAuth0({
      domain: 'dev-20qstdnd60if2bvw.us.auth0.com',
      clientId: 'Vlxn6sZT7yncZyWCLAwRufQq5tfGxFCg',
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: 'https://hr-portal/api',
        scope: 'openid profile email offline_access'
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true
    })
  ]
};

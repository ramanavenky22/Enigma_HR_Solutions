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
      domain: 'dev-hxq2jg08pca7x1u4.us.auth0.com',
      clientId: 'EQrggKzdvxoJLY2e6H3rtdPWa5aUOQd9',
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

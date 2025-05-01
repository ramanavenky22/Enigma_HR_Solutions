import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAuth0 } from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAuth0({
      domain: 'dev-hxq2jg08pca7x1u4.us.auth0.com',
      clientId: 'EQrggKzdvxoJLY2e6H3rtdPWa5aUOQd9',
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: 'https://hr-portal/api' // optional if using RBAC-secured API
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true 
    })
  ]
};

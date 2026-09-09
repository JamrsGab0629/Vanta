import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../helpers/auth/auth.services';

// Protects private routes (/app, /admin) -> redirects unauthenticated users to login
export const authGuard: CanActivateFn = async (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  try {
    const response = await authService.verifyAuth();

    if (!response.success) {
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    return true;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }
};

// Protects auth routes (/auth/login, /auth/signup) -> redirects logged-in users to /app
export const guestGuard: CanActivateFn = async (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  try {
    const response = await authService.verifyAuth();

    if (response.success) {
      return router.createUrlTree(['/app']);
    }

    return true;
  } catch (error) {
    return true;
  }
};
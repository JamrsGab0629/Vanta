import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../helpers/auth/auth.services';

export const authGuard: CanActivateFn = async (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. If running on Node.js (SSR), allow navigation to pass through
  // The browser will run this guard once hydrated
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // 2. Client-side browser execution
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
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const loginGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate(['/calendar']);
    return false;
  } else {
    return true;
  }
};

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Then check if user has admin access level
  const currentUser = authService.getCurrentUser();
  if (currentUser && currentUser.accessLevel === 'admin') {
    return true;
  } else {
    // Redirect to calendar if user is not admin
    router.navigate(['/calendar']);
    return false;
  }
};
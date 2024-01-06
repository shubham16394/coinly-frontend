import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from './login/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const loginService = inject(LoginService);
  const user = loginService.getUserFromLocalStorage();
  if(user?.email) {
    return true;
  }
  router.navigate([''], {replaceUrl: true});
  return false;
};

import { Inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const localUser=localStorage.getItem('user');
  const router=Inject(Router);
  if(localUser!=null)
  {
    return true;
  }
  else 
  {
    //navigate back to login page
    router.navigateByUrl('/login');
    return false;
  }
 
};

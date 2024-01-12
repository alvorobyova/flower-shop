import {ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from "./auth.service";
import {inject, Injectable} from "@angular/core";
// import {Location} from "@angular/common";

@Injectable({
  providedIn: 'root',
})

export class AuthForwardGuard implements CanActivate {

  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.getIsLoggedIn()) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}


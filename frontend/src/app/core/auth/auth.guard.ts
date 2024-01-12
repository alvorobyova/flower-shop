import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from "./auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {inject, Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root',
  })
export class AuthGuard implements CanActivate {

  private authService = inject(AuthService);
  private _snackBar = inject(MatSnackBar);
  private router = inject(Router)

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.authService.getIsLoggedIn();
    if(!isLoggedIn) {
      this._snackBar.open('Для доступа необходимо авторизоваться!');
      this.router.navigate(['/']);
    }
    return isLoggedIn;
  }
}

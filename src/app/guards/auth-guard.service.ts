// src/app/auth/auth-guard.service.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../@core/auth.service';
import { TokenService } from '../@core/token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private tokenService: TokenService, private authService: AuthService) {}
  canActivate(): boolean {
    // Checking if user is authenticated
    const isAuthenticated = this.authService.isAuthenticated();

    // If user is not authenticated then redirecting to starting page
    if (!isAuthenticated) {
      this.router.navigate(['.']);
      return false;
    }
    return true;
  }
}

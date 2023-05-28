import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private jwtHelper: JwtHelperService, private tokenService: TokenService) {}

  /**
   * Method checks if user is authenticated
   *
   * @returns {boolean} Returnss `true` if user is authenticated
   * @memberof AuthService
   */
  isAuthenticated(): boolean {
    // Getting current access token
    const token = this.tokenService.getToken();
    // Check if token is present and not expired. Otherwise setting that user is not authenticated
    const isAuthenticated = token && !this.jwtHelper.isTokenExpired(token);
    return isAuthenticated;
  }
}

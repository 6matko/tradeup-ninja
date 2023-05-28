import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { Request } from 'express';
import { SYSTEM_CONST } from '../app.const';
import { ISystemConst } from '../base.model';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  /**
   * Indicates if current platform is browser
   *
   * @private
   * @type {boolean}
   * @memberof TokenService
   */
  private isBrowser: boolean;
  constructor(
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: string,
    @Inject(SYSTEM_CONST) private systemConst: ISystemConst,
    @Optional() @Inject(REQUEST) private request: Request,
  ) {
    // Storing if current platform is browser or not (server)
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Setting token in transfer state to get it when view is rendered (browser platform)
   *
   * @param {string} token Token to store
   * @memberof TokenService
   */
  storeTokenInTransferState(token: string) {
    // Casting to any because it wants "void" for some reason
    this.transferState.set(makeStateKey(this.systemConst.accessTokenKey), token as any);
  }

  /**
   * Method tries to get token from transfer state (Browser platform) or from Request cookie (Server platform)
   *
   * @returns {string} Returns current access token if present
   * @memberof TokenService
   */
  getToken(): string {
    // Getting token. If current platform is browser then trying to get token from transfer state. Otherwise trying to get
    // token from server response (from cookies)
    const token = this.isBrowser ? this.getTokenFromTransferState() : this.request.cookies[this.systemConst.accessTokenKey];
    return token;
  }

  /**
   * Method tries to get token from transfer state
   *
   * @private
   * @returns {string} Returns stored token from transfer state. Returns `null` if nothing was stored
   * @memberof TokenService
   */
  private getTokenFromTransferState(): string {
    // Getting token from transfer state
    const tokenInState = this.transferState.get(makeStateKey(this.systemConst.accessTokenKey), null) as string;
    // Returning received token
    return tokenInState;
  }
}

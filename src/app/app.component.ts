import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Optional, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { I18nService } from '@app/i18n';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Logger, untilDestroyed } from '@core';
import { environment } from '@env/environment';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { TranslateService } from '@ngx-translate/core';
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import { Request } from 'express';
import { CookieService } from 'ngx-cookie-service';
import { merge, Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { TokenService } from './@core/token.service';
import { UserInfoService } from './@shared/user-info/user-info.service';
import { SYSTEM_CONST } from './app.const';
import { ISystemConst } from './base.model';

const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  /**
   * Flag indicates if GDPR bar should be shown or not
   *
   * @type {boolean}
   * @memberof AppComponent
   */
  showGDPRBar: boolean = false;
  /**
   * Subscription that watches for query param changes
   *
   * @private
   * @type {Subscription}
   * @memberof AppComponent
   */
  private queryParamSubscription: Subscription = Subscription.EMPTY;
  /**
   * Indicates if current platform is browser
   *
   * @private
   * @type {boolean}
   * @memberof AppComponent
   */
  private isBrowser: boolean;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService,
    private i18nService: I18nService,
    private angulartics2GoogleTagManager: Angulartics2GoogleTagManager,
    private cookieService: CookieService,
    @Inject(SYSTEM_CONST) private systemConst: ISystemConst,
    @Inject(PLATFORM_ID) private platformId: string,
    @Optional() @Inject(REQUEST) private request: Request,
    private userInfoService: UserInfoService,
    private tokenService: TokenService
  ) {
    // Storing information if current platform is browser for quick access
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Checking consent only on Browser platform because no need to do it on server
    if (this.isBrowser) {
      // Checking if consent was given
      const consentGiven = this.cookieService.get(this.systemConst.consentName);
      // Starting tracking if consent was given
      if (consentGiven === 'accept') {
        this.startTracking(true);
      } else {
        // If consent was not given then showing GDPR bar
        this.showGDPRBar = true;
      }
    } else {
      // Getting token from request
      const token = this.request.cookies[this.systemConst.accessTokenKey];
      // Storing token in transfer state to get it later (in browser platform)
      this.tokenService.storeTokenInTransferState(token);
    }
  }

  ngOnInit() {
    // Setup logger
    if (environment.production) {
      Logger.enableProductionMode();
    }

    log.debug('init');

    // Getting current access token
    const token = this.tokenService.getToken();
    // If we have access token then storing (initializing) user information
    if (token) {
      this.storeUserInfo(token);
    }

    // Setup translations
    this.i18nService.init(environment.defaultLanguage, environment.supportedLanguages);

    const onNavigationEnd = this.router.events.pipe(filter((event) => event instanceof NavigationEnd));

    // Change page title on navigation or language change, based on route data
    merge(this.translateService.onLangChange, onNavigationEnd)
      .pipe(
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        switchMap((route) => route.data),
        untilDestroyed(this)
      )
      .subscribe((event) => {
        const title = event.title;
        if (title) {
          this.titleService.setTitle(`${this.translateService.instant(title)} - Tradeup Ninja`);
        }
      });
  }

  ngOnDestroy() {
    this.i18nService.destroy();
    this.queryParamSubscription.unsubscribe();
  }

  /**
   * Method starts tracking GA data when consent was received
   *
   * @param {boolean} [start] Indicates if tracking should be started or not
   * @memberof AppComponent
   */
  startTracking(start?: boolean) {
    if (start) {
      // Hiding GDPR Bar since tracking is allowed
      this.showGDPRBar = false;
      // dataLayer.push({ 'event': GDPRConsentEventName, 'Consent received': 1 });
      this.angulartics2GoogleTagManager.pushLayer({
        // event: this.systemConst.consentName,
        action: 'Give consent',
        value: 'accept',
      });
      // Src: https://github.com/angulartics/angulartics2/tree/master/src/lib/providers/gtm
      this.angulartics2GoogleTagManager.startTracking();
    }
  }

  /**
   * Method stores user information
   *
   * @private
   * @param {string} [token=''] User token
   * @memberof AppComponent
   */
  private storeUserInfo(token: string = '') {
    const jwtHelper = new JwtHelperService();
    const decodedToken = jwtHelper.decodeToken(token);
    this.userInfoService.emitUserInfo(decodedToken);
  }
}

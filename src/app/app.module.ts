import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { CoreModule } from '@core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared';
import { Angulartics2Module } from 'angulartics2';
import { CookieService } from 'ngx-cookie-service';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { ToastrModule } from 'ngx-toastr';
import { TokenService } from './@core/token.service';
import { UserInfoModule } from './@shared/user-info/user-info.module';
import { AboutModule } from './about/about.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SYSTEM_CONST } from './app.const';
import { GdprBarComponent } from './gdpr-bar/gdpr-bar.component';
import { ShellModule } from './shell/shell.module';
import { TradeupSearchModule } from './tradeup-search/tradeup-search.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';

const dbConfig: DBConfig = {
  name: 'TradeupDB',
  version: 2,
  objectStoresMeta: [
    {
      store: 'result',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'tradeupName', keypath: 'tradeupName', options: { unique: false } },
        { name: 'inputItems', keypath: 'inputItems', options: { unique: false } },
        { name: 'outcome', keypath: 'outcome', options: { unique: false } },
        { name: 'outcomeFloat', keypath: 'outcomeFloat', options: { unique: false } },
        { name: 'stattrak', keypath: 'stattrak', options: { unique: false } },
        { name: 'summary', keypath: 'summary', options: { unique: false } },
        { name: 'calculatedSummary', keypath: 'calculatedSummary', options: { unique: false } },
        { name: 'received', keypath: 'received', options: { unique: false } },
        { name: 'notes', keypath: 'notes', options: { unique: false } },
        { name: 'created', keypath: 'created', options: { unique: false } },
        { name: 'completed', keypath: 'completed', options: { unique: false } },
        { name: 'modified', keypath: 'modified', options: { unique: false } },
        { name: 'floatRequired', keypath: 'floatRequired', options: { unique: false } },
      ],
    },
    {
      store: 'preferences',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'darkMode', keypath: 'darkMode', options: { unique: false } },
        { name: 'language', keypath: 'language', options: { unique: false } },
        { name: 'displayCurrency', keypath: 'displayCurrency', options: { unique: false } },
      ],
    },
  ],
};

// Creating a factory with JWT settings. We need to do it to get token from transfer state
export function jwtOptionsFactory(tokenService: TokenService) {
  return {
    tokenGetter: () => {
      // Getting token from transfer state if we had one
      const token = tokenService.getToken();
      return token;
    },
  };
}

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    TransferHttpCacheModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    NgbModule,
    CoreModule,
    SharedModule,
    ShellModule,
    AboutModule,
    UserInfoModule,
    TradeupSearchModule,
    Angulartics2Module.forRoot(),
    // Src: https://github.com/auth0/angular2-jwt/issues/30#issuecomment-397707616
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [TokenService],
      },
    }),
    ToastrModule.forRoot({
      timeOut: 6000,
    }),
    NgxIndexedDBModule.forRoot(dbConfig),
    UserPreferencesModule,
    AppRoutingModule, // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent, GdprBarComponent],
  providers: [CookieService, { provide: SYSTEM_CONST, useValue: SYSTEM_CONST }],
  bootstrap: [AppComponent],
})
export class AppModule {}

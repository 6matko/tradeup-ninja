import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreModule } from '@core';
import { TranslateModule } from '@ngx-translate/core';
import { Angulartics2Module } from 'angulartics2';
import { AppComponent } from './app.component';
import { SYSTEM_CONST } from './app.const';
import { GdprBarComponent } from './gdpr-bar/gdpr-bar.component';


describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot(), CoreModule, Angulartics2Module.forRoot()],
      declarations: [AppComponent, GdprBarComponent],
      providers: [{
        provide: SYSTEM_CONST,
        useValue: {
          consentName: 'mockConsentName',
        },
      },
      ],
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }), 30000);
});

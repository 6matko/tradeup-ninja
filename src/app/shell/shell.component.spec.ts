import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { I18nModule } from '@app/i18n';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import 'chart.js';
import { SYSTEM_CONST } from '../app.const';
import { TradeupSimulationModule } from '../tradeup-simulation/tradeup-simulation.module';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { ScrollToTopComponent } from './scroll-to-top/scroll-to-top.component';
import { ShellComponent } from './shell.component';


describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot(), I18nModule, NgbModule, TradeupSimulationModule],
      declarations: [HeaderComponent, ShellComponent, ScrollToTopComponent, FooterComponent],
      providers: [
        {
          provide: SYSTEM_CONST,
          useValue: {
            discordUrl: 'MockDiscordUrl',
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { I18nModule } from '@app/i18n';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { UserInfoModule } from '../@shared/user-info/user-info.module';
import { TradeupSimulationModule } from '../tradeup-simulation/tradeup-simulation.module';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { ScrollToTopComponent } from './scroll-to-top/scroll-to-top.component';
import { ShellComponent } from './shell.component';
import { SidebarComponent } from './sidebar/sidebar.component';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    NgbModule,
    I18nModule,
    RouterModule,
    TradeupSimulationModule,
    NgbTooltipModule,
    UserInfoModule,
  ],
  declarations: [
    HeaderComponent,
    ShellComponent,
    ScrollToTopComponent,
    FooterComponent,
    SidebarComponent,
  ],
})
export class ShellModule { }

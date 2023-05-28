import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AboutGeneralComponent } from './about-general/about-general.component';
import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    AboutRoutingModule,
  ],
  declarations: [
    AboutComponent,
    AboutGeneralComponent,
  ],
})
export class AboutModule { }

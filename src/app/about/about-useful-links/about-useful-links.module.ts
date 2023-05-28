import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AboutUsefulLinksRoutingModule } from './about-useful-links-routing.module';
import { AboutUsefulLinksComponent } from './about-useful-links.component';

@NgModule({
  imports: [
    CommonModule,
    AboutUsefulLinksRoutingModule,
  ],
  declarations: [AboutUsefulLinksComponent]
})
export class AboutUsefulLinksModule { }

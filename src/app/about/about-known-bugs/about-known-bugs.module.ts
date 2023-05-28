import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AboutKnownBugsRoutingModule } from './about-known-bugs-routing.module';
import { AboutKnownBugsComponent } from './about-known-bugs.component';

@NgModule({
  imports: [
    CommonModule,
    AboutKnownBugsRoutingModule,
  ],
  declarations: [AboutKnownBugsComponent]
})
export class AboutKnownBugsModule { }

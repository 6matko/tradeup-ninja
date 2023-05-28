import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AboutChangelogRoutingModule } from './about-changelog-routing.module';
import { AboutChangelogComponent } from './about-changelog.component';

@NgModule({
  imports: [
    CommonModule,
    AboutChangelogRoutingModule,
  ],
  declarations: [AboutChangelogComponent]
})
export class AboutChangelogModule { }

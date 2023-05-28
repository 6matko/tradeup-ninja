import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AboutPlannedFeaturesRoutingModule } from './about-planned-features-routing.module';
import { AboutPlannedFeaturesComponent } from './about-planned-features.component';

@NgModule({
  imports: [
    CommonModule,
    AboutPlannedFeaturesRoutingModule,
  ],
  declarations: [AboutPlannedFeaturesComponent]
})
export class AboutPlannedFeaturesModule { }

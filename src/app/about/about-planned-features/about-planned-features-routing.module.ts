import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/i18n';
import { AboutPlannedFeaturesComponent } from './about-planned-features.component';

const routes: Routes = [
    // Module is lazy loaded, see about-routing.module.ts
    { path: '', component: AboutPlannedFeaturesComponent, data: { title: extract('Planned features') } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class AboutPlannedFeaturesRoutingModule { }

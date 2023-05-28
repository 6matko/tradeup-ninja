import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/i18n';
import { DonateComponent } from './donate.component';

const routes: Routes = [
    // Module is lazy loaded, see app-routing.module.ts
    { path: '', component: DonateComponent, data: { title: extract('Donate') } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class DonateRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/i18n';
import { AboutKnownBugsComponent } from './about-known-bugs.component';

const routes: Routes = [
    // Module is lazy loaded, see about-routing.module.ts
    { path: '', component: AboutKnownBugsComponent, data: { title: extract('Known issues') } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class AboutKnownBugsRoutingModule { }

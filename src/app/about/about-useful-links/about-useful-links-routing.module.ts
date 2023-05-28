import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/i18n';
import { AboutUsefulLinksComponent } from './about-useful-links.component';

const routes: Routes = [
    // Module is lazy loaded, see about-routing.module.ts
    { path: '', component: AboutUsefulLinksComponent, data: { title: extract('Useful links') } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class AboutUsefulLinksRoutingModule { }

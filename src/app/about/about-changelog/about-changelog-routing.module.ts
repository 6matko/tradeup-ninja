import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/i18n';
import { AboutChangelogComponent } from './about-changelog.component';

const routes: Routes = [
    // Module is lazy loaded, see about-routing.module.ts
    { path: '', component: AboutChangelogComponent, data: { title: extract('Changelog') } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class AboutChangelogRoutingModule { }

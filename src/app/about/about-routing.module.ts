import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/i18n';
import { Shell } from '../shell/shell.service';
import { AboutGeneralComponent } from './about-general/about-general.component';
import { AboutComponent } from './about.component';


const routes: Routes = [
  Shell.childRoutes([
    {
      path: '',
      component: AboutComponent,
      children: [
        {
          path: '',
          redirectTo: 'about',
          pathMatch: 'full'
        },
        {
          path: 'about',
          component: AboutGeneralComponent,
          data: { title: extract('About') },
        },
        {
          path: 'useful',
          loadChildren: () => import('./about-useful-links/about-useful-links.module').then((m) => m.AboutUsefulLinksModule),
        },
        // {
        //   path: 'changelog',
        //   loadChildren: () => import('./about-changelog/about-changelog.module').then((m) => m.AboutChangelogModule),
        // },
        {
          path: 'planned',
          loadChildren: () => import('./about-planned-features/about-planned-features.module').then((m) => m.AboutPlannedFeaturesModule),
        },
        {
          path: 'issues',
          loadChildren: () => import('./about-known-bugs/about-known-bugs.module').then((m) => m.AboutKnownBugsModule),
        },
      ]
    },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class AboutRoutingModule { }

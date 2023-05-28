import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/i18n';
import { InputOverviewCollectionDisplayComponent } from './input-overview-collection-display/input-overview-collection-display.component';
import { InputOverviewCollectionResolverService } from './input-overview-collection-resolver.service';
import { InputOverviewCollectionsComponent } from './input-overview-collections/input-overview-collections.component';
import { InputOverviewComponent } from './input-overview.component';

const routes: Routes = [
    // Module is lazy loaded, see app-routing.module.ts
    { path: '', component: InputOverviewComponent, data: { title: extract('Trade up input overview') } },
    { path: 'collections', component: InputOverviewCollectionsComponent, data: { title: extract('Trade up input overview by collections') } },
    {
        path: 'collections/:collectionKey', component: InputOverviewCollectionDisplayComponent,
        resolve: { collectionSkins: InputOverviewCollectionResolverService, }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class InputOverviewRoutingModule { }

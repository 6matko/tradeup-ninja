import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { extract } from '@app/i18n';
import { StickerPriceComponent } from './sticker-price.component';


const routes: Routes = [
    // Module is lazy loaded, see app-routing.module.ts
    { path: '', component: StickerPriceComponent, data: { title: extract('Sticker price checker on skin') } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [],
})
export class StickerPriceRoutingModule { }

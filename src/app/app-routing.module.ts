import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { extract } from './i18n';
import { TradeupSearchComponent } from './tradeup-search/tradeup-search.component';
import { TradeupShareDisplayComponent } from './tradeup-search/tradeup-share-display/tradeup-share-display.component';
import { TradeupShareResolverService } from './tradeup-search/tradeup-share-resolver.service';

const routes: Routes = [
  {
    path: 'sp-check',
    loadChildren: () => import('./sticker-price/sticker-price.module').then((m) => m.StickerPriceModule),
  },
  Shell.childRoutes([
    { path: 'search', component: TradeupSearchComponent, data: { title: extract('Trade up search') } },
    {
      path: 'share',
      component: TradeupShareDisplayComponent,
      // data: {
      //   title: extract('Shared trade up')
      // },
      resolve: { tradeupInfo: TradeupShareResolverService },
    },
    {
      path: 'calculator',
      loadChildren: () =>
        import('./tradeup-calculator/tradeup-calculator.module').then((m) => m.TradeupCalculatorModule),
    },
    {
      path: 'results',
      loadChildren: () => import('./tradeup-result/tradeup-result.module').then((m) => m.TradeupResultModule),
    },
    {
      path: 'input-overview',
      loadChildren: () => import('./input-overview/input-overview.module').then((m) => m.InputOverviewModule),
    },
    {
      path: 'legal',
      loadChildren: () => import('./legal-documents/legal-documents.module').then((m) => m.LegalDocumentsModule),
    },
    {
      path: 'contacts',
      loadChildren: () => import('./contacts/contacts.module').then((m) => m.ContactsModule),
    },
    {
      path: 'donate',
      loadChildren: () => import('./donate/donate.module').then((m) => m.DonateModule),
    },
    {
      path: 'inventory',
      // canActivate: [AuthGuard],
      loadChildren: () => import('./inventory/inventory.module').then((m) => m.InventoryModule),
    },
  ]),
  // Fallback when no prior route is matched
  { path: '**', redirectTo: 'about', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'enabled',
      initialNavigation: 'enabled',
    }),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}

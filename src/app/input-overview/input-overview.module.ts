import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { SkinPriceTableModule } from '../@shared/skin-price-table/skin-price-table.module';
import { InputOverviewRoutingModule } from './input-overivew-routing.module';
import { InputOverviewCollectionDisplayComponent } from './input-overview-collection-display/input-overview-collection-display.component';
import { InputOverviewCollectionsComponent } from './input-overview-collections/input-overview-collections.component';
import { InputOverviewComponent } from './input-overview.component';

@NgModule({
  imports: [
    CommonModule,
    InputOverviewRoutingModule,
    NgbNavModule,
    VirtualScrollerModule,
    FormsModule,
    SkinPriceTableModule,
    RouterModule,
  ],
  declarations: [
    InputOverviewComponent,
    InputOverviewCollectionsComponent,
    InputOverviewCollectionDisplayComponent,
  ],
  providers: [
  ],
})
export class InputOverviewModule { }

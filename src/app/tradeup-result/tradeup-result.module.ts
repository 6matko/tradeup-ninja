import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModalModule, NgbNavModule, NgbTooltipModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatePickerModule } from '@ngx-tiny/date-picker';
import { ChartsModule } from 'ng2-charts';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { SharedTradeupModule } from '../@shared/shared-tradeup/shared-tradeup.module';
import { FloatToConditionModule } from '../pipes/float-to-condition.module';
import { AddEditResultModalComponent } from './add-edit-result-modal/add-edit-result-modal.component';
import { ResultCollectionStatsComponent } from './result-collection-stats/result-collection-stats.component';
import { ResultPreviewComponent } from './result-preview/result-preview.component';
import { TradeupInputInfoComponent } from './tradeup-input-info/tradeup-input-info.component';
import { TradeupResultChartComponent } from './tradeup-result-chart/tradeup-result-chart.component';
import { TradeupResultFilterComponent } from './tradeup-result-filter/tradeup-result-filter.component';
import { TradeupResultRoutingModule } from './tradeup-result-routing.module';
import { TradeupResultSortComponent } from './tradeup-result-sort/tradeup-result-sort.component';
import { TradeupResultComponent } from './tradeup-result.component';

@NgModule({
  imports: [
    CommonModule,
    TradeupResultRoutingModule,
    NgbModalModule,
    NgbTooltipModule,
    NgbNavModule,
    NgbTypeaheadModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    SharedTradeupModule,
    FloatToConditionModule,
    ChartsModule,
    VirtualScrollerModule,
    NgxDatePickerModule,
  ],
  declarations: [
    TradeupResultComponent,
    ResultPreviewComponent,
    AddEditResultModalComponent,
    TradeupInputInfoComponent,
    TradeupResultSortComponent,
    ResultCollectionStatsComponent,
    TradeupResultChartComponent,
    TradeupResultFilterComponent,
  ],
})
export class TradeupResultModule { }

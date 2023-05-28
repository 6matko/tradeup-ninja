import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedTradeupModule } from '../@shared/shared-tradeup/shared-tradeup.module';
import { FloatToConditionModule } from '../pipes/float-to-condition.module';
import { TradeupDisplayComponent } from './tradeup-display/tradeup-display.component';
import { TradeupFilterComponent } from './tradeup-filter/tradeup-filter.component';
import { TradeupOutputComponent } from './tradeup-output/tradeup-output.component';
import { TradeupSearchComponent } from './tradeup-search.component';
import { TradeupSearchService } from './tradeup-search.service';
import { TradeupSettingsComponent } from './tradeup-settings/tradeup-settings.component';
import { TradeupShareDisplayComponent } from './tradeup-share-display/tradeup-share-display.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    FloatToConditionModule,
    SharedTradeupModule,
    NgSelectModule,
    RouterModule,
  ],
  declarations: [
    TradeupSearchComponent,
    TradeupOutputComponent,
    TradeupDisplayComponent,
    TradeupSettingsComponent,
    TradeupFilterComponent,
    TradeupShareDisplayComponent,
  ],
  providers: [
    TradeupSearchService,
  ],
})
export class TradeupSearchModule { }

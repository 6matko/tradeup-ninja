import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
// tslint:disable-next-line:max-line-length
import {
  NgbAccordionModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbNavModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbTooltipModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrModule } from 'ngx-toastr';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { SharedTradeupModule } from '../@shared/shared-tradeup/shared-tradeup.module';
import { SkinPriceTableModule } from '../@shared/skin-price-table/skin-price-table.module';
import { SkinSelectAutocompleteModule } from '../@shared/skin-select-autocomplete/skin-select-autocomplete.module';
import { FloatToConditionModule } from '../pipes/float-to-condition.module';
import { PriceFromFloatModule } from '../pipes/price-from-float/price-from-float.module';
import { TextHighlightModule } from '../pipes/text-highlight/text-highlight.module';
import { CalculatorAddItemModalComponent } from './calculator-add-item-modal/calculator-add-item-modal.component';
import { CalculatorAddMultipleInventoryModalComponent } from './calculator-add-multiple-inventory-modal/calculator-add-multiple-inventory-modal.component';
import { CalculatorInputItemComponent } from './calculator-input-item/calculator-input-item.component';
import { SetCustomPriceModalComponent } from './set-custom-price-modal/set-custom-price-modal.component';
import { TradeupCalculatorActionsComponent } from './tradeup-calculator-actions/tradeup-calculator-actions.component';
import { TradeupCalculatorOutcomeComponent } from './tradeup-calculator-outcome/tradeup-calculator-outcome.component';
import { TradeupCalculatorOverviewComponent } from './tradeup-calculator-overview/tradeup-calculator-overview.component';
import { TradeupCalculatorRoutingModule } from './tradeup-calculator-routing.module';
import { TradeupCalculatorSummaryComponent } from './tradeup-calculator-summary/tradeup-calculator-summary.component';
import { TradeupCalculatorComponent } from './tradeup-calculator.component';
import { TradeupCalculatorService } from './tradeup-calculator.service';

@NgModule({
  imports: [
    CommonModule,
    TradeupCalculatorRoutingModule,
    ReactiveFormsModule,
    NgbTypeaheadModule,
    TextHighlightModule,
    NgbTooltipModule,
    NgbPopoverModule,
    SkinSelectAutocompleteModule,
    PriceFromFloatModule,
    FloatToConditionModule,
    NgbNavModule,
    NgbModalModule,
    NgbAccordionModule,
    SkinPriceTableModule,
    VirtualScrollerModule,
    NgbDropdownModule,
    SharedTradeupModule,
    NgbProgressbarModule,
    ToastrModule,
    NgSelectModule,
  ],
  declarations: [
    TradeupCalculatorComponent,
    CalculatorInputItemComponent,
    TradeupCalculatorOutcomeComponent,
    TradeupCalculatorSummaryComponent,
    CalculatorAddItemModalComponent,
    TradeupCalculatorActionsComponent,
    SetCustomPriceModalComponent,
    TradeupCalculatorOverviewComponent,
    CalculatorAddMultipleInventoryModalComponent,
  ],
  providers: [TradeupCalculatorService],
})
export class TradeupCalculatorModule {}

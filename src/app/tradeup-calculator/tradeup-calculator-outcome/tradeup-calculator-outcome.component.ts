import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Weapon } from '@server/items';
import { getFloatIndexForPrice, getPrice, getVolume } from '../../tradeup-search/tradeup-shared-utils';
import { ITradeupSettings, TradeupOutcome, TradeupSummary } from '../../tradeup-search/tradeup.model';
import { SetCustomPriceModalComponent } from '../set-custom-price-modal/set-custom-price-modal.component';

@Component({
  selector: 'app-tradeup-calculator-outcome',
  templateUrl: './tradeup-calculator-outcome.component.html',
  styleUrls: ['./tradeup-calculator-outcome.component.scss'],
})
export class TradeupCalculatorOutcomeComponent implements OnInit {
  /**
   * Trade up summary
   *
   * @type {TradeupSummary}
   * @memberof TradeupCalculatorOutcomeComponent
   */
  @Input() tradeupSummary: TradeupSummary;
  /**
   * Trade up settings
   *
   * @type {ITradeupSettings}
   * @memberof TradeupCalculatorOutcomeComponent
   */
  @Input() tradeupSettings: ITradeupSettings;
  /**
   * Event emitter that emits updated outccome when outcome price has changed
   *
   * @type {EventEmitter<TradeupOutcome>}
   * @memberof TradeupCalculatorOutcomeComponent
   */
  @Output() outcomePriceChanged: EventEmitter<TradeupOutcome> = new EventEmitter();
  constructor(private modalService: NgbModal) { }

  ngOnInit() { }

  /**
   * Method gets price for specific skin based on its float
   *
   * @param {Weapon} skin Skin
   * @param {number} float Skin float
   * @param {boolean} [withoutTax] Optional flag that will return skin price without steam tax
   * @returns {number} Returns skin price
   * @memberof TradeupCalculatorOutcomeComponent
   */
  getSkinPrice(skin: Weapon, float: number, withoutTax?: boolean): number {
    return getPrice(skin, float, this.tradeupSettings?.stattrak, withoutTax);
  }

  /**
   * Method gets items float and returns it
   *
   * @param {Weapon} item Skin which float we need to get
   * @param {number} float Float of skin to get correct volume based on condition
   * @returns {number} Returns volume
   * @memberof TradeupCalculatorOutcomeComponent
   */
  getVolume(item: Weapon, float: number): number {
    return getVolume(item, float, this.tradeupSettings?.stattrak);
  }

  /**
   * Method opens modal for setting custom price. On success updates outcome price and emits it
   *
   * @param {TradeupOutcome} outcome Outcome for which new price should be set
   * @memberof TradeupCalculatorOutcomeComponent
   */
  openCustomPriceModal(outcome: TradeupOutcome) {
    const modalRef = this.modalService.open(SetCustomPriceModalComponent, {
      size: 'sm',
    });

    // Storing current price on custom price modal component (as initial value)
    modalRef.componentInstance.currentPrice = getPrice(
      outcome.item,
      outcome.float,
      this.tradeupSettings.stattrak,
      false
    );
    // Storing other useful information that will be used for display
    modalRef.componentInstance.currentItem = outcome.item;
    modalRef.componentInstance.currentItemFloat = outcome.float;

    modalRef.result.then(
      (newPrice: { priceBeforeTax: number }) => {
        // Getting float index
        const floatIndex = getFloatIndexForPrice(outcome.float);
        // Updating price depending on if its stattrak or normal weapon
        // TODO: Implement price setting based on provider
        if (this.tradeupSettings.stattrak) {
          outcome.item.price.stattrak[floatIndex] = newPrice.priceBeforeTax;
        } else {
          outcome.item.price.normal[floatIndex] = newPrice.priceBeforeTax;
        }
        // alert('NEEDS IMPLEMENTATION');
        // Emitting updated outcome
        this.outcomePriceChanged.emit(outcome);
        // NOTE: this should remain empty even if not used to avoid errors`
      },
      () => { }
    );
  }
}

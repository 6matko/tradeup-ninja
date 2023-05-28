import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Weapon } from '@server/items';
import { getPrice } from '../../tradeup-search/tradeup-shared-utils';
import { ITradeupSettings, TradeupSummary } from '../../tradeup-search/tradeup.model';

@Component({
  selector: 'app-tradeup-calculator-overview',
  templateUrl: './tradeup-calculator-overview.component.html',
  styleUrls: ['./tradeup-calculator-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupCalculatorOverviewComponent implements OnInit {
  /**
   * Input item form controls
   *
   * @type {FormControl[]}
   * @memberof TradeupCalculatorOverviewComponent
   */
  @Input() inputItems: FormControl[];
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
   * Event emitter that emits event when overview should be closed
   *
   * @type {EventEmitter<void>}
   * @memberof TradeupCalculatorOverviewComponent
   */
  @Output() overviewClosed: EventEmitter<void> = new EventEmitter();
  /**
   * Flag indicates if overview is shown
   *
   * @type {boolean}
   * @memberof TradeupCalculatorOverviewComponent
   */
  isShown: boolean;
  /**
   * Flag indicates if full screen mode should be opened. This is needed for transitions as weell
   *
   * @type {boolean}
   * @memberof TradeupCalculatorOverviewComponent
   */
  fullScreen: boolean;
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Adding timeout just to show transition.
    // We need to do it because this component gets show/hidden via ngIf
    // and that means that after component was created it doesn't have height
    // to display it and therefore we are creating this component with hidden menu (initially).
    // After some time we mark that menu is shown and transition can be performed
    setTimeout(() => {
      this.isShown = true;
      this.cdr.markForCheck();
    }, 100);
    // We need to set this flag to true after it was shown in order
    // for transition to work. Otherwise transition doesn't work with height: 100%
    setTimeout(() => {
      this.fullScreen = true;
      this.cdr.markForCheck();
    }, 200);
  }

  /**
   * Method closes (dismisses) tradeup simulator menu
   *
   * @memberof TradeupCalculatorOverviewComponent
   */
  closeOverview() {
    // Marking that menu should not be shown anymore
    this.isShown = false;
    this.fullScreen = false;
    // Marking view for change detection check in order to display changes in view
    this.cdr.markForCheck();
    // And finally adding timeout only for case to show transition of menu closing
    // and afterwards we destroy component
    setTimeout(() => {
      this.overviewClosed.emit();
    }, 300);
  }

  /**
   * Method gets price for specific skin based on its float
   *
   * @param {Weapon} skin Skin
   * @param {number} float Skin float
   * @param {boolean} [withoutTax] Optional flag that will return skin price without steam tax
   * @returns {number} Returns skin price
   * @memberof TradeupCalculatorOutcomeComponent
   */
  getSkinPrice(skin: Weapon, float: number): number {
    return getPrice(skin, float, this.tradeupSettings?.stattrak, this.tradeupSettings?.withoutSteamTax);
  }
}

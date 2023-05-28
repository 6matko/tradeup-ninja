import { Component, Input, OnInit } from '@angular/core';
import { ITradeupSettings, TradeupSummary } from '../../tradeup-search/tradeup.model';

@Component({
  selector: 'app-tradeup-calculator-summary',
  templateUrl: './tradeup-calculator-summary.component.html',
  styleUrls: ['./tradeup-calculator-summary.component.scss']
})
export class TradeupCalculatorSummaryComponent implements OnInit {
  /**
   * Trade up summary
   *
   * @type {TradeupSummary}
   * @memberof TradeupCalculatorSummaryComponent
   */
  @Input() tradeupSummary: TradeupSummary;
  /**
   * Trade up settings
   *
   * @type {ITradeupSettings}
   * @memberof TradeupCalculatorSummaryComponent
   */
  @Input() tradeupSettings: ITradeupSettings;
  constructor() { }

  ngOnInit() {
  }

}

import { Component, Input, OnInit } from '@angular/core';
import { TradeupOutputMessage } from '../tradeup.model';

@Component({
  selector: 'app-tradeup-output',
  templateUrl: './tradeup-output.component.html',
  styleUrls: ['./tradeup-output.component.scss']
})
export class TradeupOutputComponent implements OnInit {
  /**
   * All secondary messages
   *
   * @type {TradeupOutputMessage[]}
   * @memberof TradeupOutputComponent
   */
  @Input() messages: TradeupOutputMessage[] = [];
  /**
   * Sticky messages that should be always displayed at the top
   *
   * @type {TradeupOutputMessage[]}
   * @memberof TradeupOutputComponent
   */
  @Input() stickyMessages: TradeupOutputMessage[] = [];
  constructor() { }

  ngOnInit() {
  }

}

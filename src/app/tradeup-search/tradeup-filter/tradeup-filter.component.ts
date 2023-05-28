import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TradeupFilterEnum } from '../tradeup.model';

@Component({
  selector: 'app-tradeup-filter',
  templateUrl: './tradeup-filter.component.html',
  styleUrls: ['./tradeup-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupFilterComponent {
  /**
   * Event emitter that emits selected filtering (sorting) option
   *
   * @type {EventEmitter<TradeupFilterEnum>}
   * @memberof TradeupFilterComponent
   */
  @Output() filter: EventEmitter<TradeupFilterEnum> = new EventEmitter<TradeupFilterEnum>();
  /**
   * Currently selected filtering (sorting) option. Used for displaying active option
   *
   * @type {TradeupFilterEnum}
   * @memberof TradeupFilterComponent
   */
  currentOption: TradeupFilterEnum;
  constructor() { }

  /**
   * Method emits selected filtering (sorting) option
   *
   * @param {TradeupFilterEnum} filter Filtering option
   * @memberof TradeupFilterComponent
   */
  selectFilter(filter: TradeupFilterEnum) {
    this.currentOption = filter;
    this.filter.emit(filter);
  }
}

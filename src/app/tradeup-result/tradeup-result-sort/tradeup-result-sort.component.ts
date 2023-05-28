import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TradeupResultSortEnum } from './tradeup-result-sort.model';

@Component({
  selector: 'app-tradeup-result-sort',
  templateUrl: './tradeup-result-sort.component.html',
  styleUrls: ['./tradeup-result-sort.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupResultSortComponent {
  /**
   * Event emitter that emits selected filtering (sorting) option
   *
   * @type {EventEmitter<TradeupResultSortEnum>}
   * @memberof TradeupFilterComponent
   */
  @Output() sort: EventEmitter<TradeupResultSortEnum> = new EventEmitter();
  /**
   * Currently selected filtering (sorting) option. Used for displaying active option
   *
   * @type {TradeupResultSortEnum}
   * @memberof TradeupFilterComponent
   */
  currentOption: TradeupResultSortEnum;
  constructor() { }

  /**
   * Method emits selected filtering (sorting) option
   *
   * @param {TradeupResultSortEnum} filter Filtering option
   * @memberof TradeupFilterComponent
   */
  selectFilter(filter: TradeupResultSortEnum) {
    this.currentOption = filter;
    this.sort.emit(filter);
  }
}

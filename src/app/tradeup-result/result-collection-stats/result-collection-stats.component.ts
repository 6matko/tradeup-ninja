import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ResultCollectionStats } from './result-collection-stats.model';

@Component({
  selector: 'app-result-collection-stats',
  templateUrl: './result-collection-stats.component.html',
  styleUrls: ['./result-collection-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultCollectionStatsComponent {
  /**
   * Stats for tradeup results per collection
   *
   * @type {ResultCollectionStats}
   * @memberof ResultCollectionStatsComponent
   */
  @Input() stats: ResultCollectionStats[] = [];
  /**
   * Emits event when stats floating block should be dismissed
   *
   * @type {EventEmitter<void>}
   * @memberof ResultCollectionStatsComponent
   */
  @Output() dismiss: EventEmitter<void> = new EventEmitter();
  /**
   * Little hack that is used to fix initial "click outside component" logic
   *
   * @private
   * @type {boolean}
   * @memberof ResultCollectionStatsComponent
   */
  private initial: boolean = true;
  constructor(
    private elementRef: ElementRef<any>,
  ) { }

  /**
   * Method handles clicks outside of this component to dismiss it
   *
   * @param {Event} event Click event
   * @memberof ResultCollectionStatsComponent
   */
  @HostListener('document:click', ['$event'])
  clickHandler(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // If this is innitial "Click outside of component" then we set flag initial flag
      // to false because next click won't be initial. This is a hack to prevent immediate dismiss
      // because when this component is shown via button it triggers "click outside" and therefore
      // immediatly dismisses it.
      if (this.initial) {
        this.initial = false;
      } else {
        this.dismiss.emit();
      }
    }
  }
}

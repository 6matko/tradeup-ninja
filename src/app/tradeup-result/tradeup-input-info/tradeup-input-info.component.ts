import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Weapon } from '@server/items';
import { Subscription } from 'rxjs';
import { getPrice, getRarityName } from '../../tradeup-search/tradeup-shared-utils';
import { UserPreferencesLoaderService } from '../../user-preferences/user-preferences-loader.service';
import { UserPreferences } from '../../user-preferences/user-preferences.model';
import { TradeupResult } from '../tradeup-result.model';

@Component({
  selector: 'app-tradeup-input-info',
  templateUrl: './tradeup-input-info.component.html',
  styleUrls: ['./tradeup-input-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupInputInfoComponent implements OnInit, OnDestroy {
  /**
   * Information about tradeup result which contains tradeup inputs
   *
   * @type {TradeupResult}
   * @memberof TradeupInputInfoComponent
   */
  @Input() result: TradeupResult;
  /**
   * Event emitter that emits events if this information should be dismissed. Usually on click outside of component
   *
   * @type {EventEmitter<boolean>}
   * @memberof TradeupInputInfoComponent
   */
  @Output() dismiss: EventEmitter<boolean> = new EventEmitter<boolean>();
  /**
   * Skin that has to be previewed
   *
   * @type {Weapon}
   * @memberof TradeupInputInfoComponent
   */
  previewSkin: Weapon;
  /**
   * User preferences
   *
   * @type {UserPreferences}
   * @memberof TradeupInputInfoComponent
   */
  userPreferences: UserPreferences;
  /**
   * Little hack that is used to fix initial "click outside component" logic
   *
   * @private
   * @type {boolean}
   * @memberof TradeupInputInfoComponent
   */
  private initial: boolean = true;
  /**
   * Subscription that watches for user preference changes
   *
   * @private
   * @type {Subscription}
   * @memberof TradeupInputInfoComponent
   */
  private preferenceChangeSubscription: Subscription = Subscription.EMPTY;
  constructor(
    private elementRef: ElementRef<any>,
    private userPreferencesService: UserPreferencesLoaderService,
    private cdr: ChangeDetectorRef
  ) {
    // Storing user preferences for quick access
    this.userPreferences = this.userPreferencesService.getPreferences();
  }

  ngOnInit() {
    // Subscribing to user preference change in order to update them
    this.preferenceChangeSubscription = this.userPreferencesService.userPreferenceChange$.subscribe((prefs) => {
      // Updating preferences
      this.userPreferences = prefs;
      // Marking that view has to be re-rendered because there are changes
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.preferenceChangeSubscription.unsubscribe();
  }

  /**
   * Method gets price for specific skin based on its float
   *
   * @param {Weapon} skin Skin
   * @param {number} float Skin float
   * @param {boolean} [withoutTax] Optional flag that will return skin price without steam tax
   * @returns {number} Returns skin price
   * @memberof TradeupInputInfoComponent
   */
  getSkinPrice(skin: Weapon, float: number, withoutTax?: boolean): number {
    return getPrice(skin, float, this.result.stattrak, withoutTax);
  }

  /**
   * Method gets rarity name by value and returns it
   *
   * @param {number} rarity Rarity value
   * @returns {string} Returns rarity name
   * @memberof TradeupInputInfoComponent
   */
  getSkinRarityName(rarity: number): string {
    return getRarityName(rarity);
  }

  /**
   * Method handles clicks outside of this component to dismiss it
   *
   * @param {Event} event Click event
   * @memberof TradeupInputInfoComponent
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
        this.dismiss.emit(true);
      }
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Collection, Weapon } from '@server/items';
import { Observable, Subscription } from 'rxjs';
import { UserInfoService } from '../../@shared/user-info/user-info.service';
import { InventoryItem } from '../../inventory/inventory.model';
import { InventoryService } from '../../inventory/inventory.service';
import { TradeupSearchSettings, WeaponRarity } from '../tradeup.model';

/**
 * Dropdown list types
 */
type DropdownListType = 'primaryCollections' | 'excludeCollections' | 'includeCollections' | 'excludeSkins';

@Component({
  selector: 'app-tradeup-settings',
  templateUrl: './tradeup-settings.component.html',
  styleUrls: ['./tradeup-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupSettingsComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * Current tradeup search settings
   *
   * @type {TradeupSearchSettings}
   * @memberof TradeupSettingsComponent
   */
  @Input() settings: TradeupSearchSettings;
  /**
   * All collections for include/exclude
   *
   * @type {Collection[]}
   * @memberof TradeupSettingsComponent
   */
  @Input() collections: Collection[] = [];
  /**
   * Optional input for displaying date when prices were updated/synced last time
   *
   * @type {(string | Date)}
   * @memberof TradeupSettingsComponent
   */
  @Input() lastUpdate: string | Date = '';
  /**
   * List with skins that are available for select (to exclude from search)
   *
   * @type {Weapon[]}
   * @memberof TradeupSettingsComponent
   */
  @Input() skinsForSelect: Weapon[] = [];
  /**
   * Event emitter that emits updated tradeup settings when settings were adjusted
   *
   * @type {EventEmitter<TradeupSearchSettings>}
   * @memberof TradeupSettingsComponent
   */
  @Output() settingsChanged: EventEmitter<TradeupSearchSettings> = new EventEmitter<TradeupSearchSettings>();
  /**
   * Settings form
   *
   * @type {FormGroup}
   * @memberof TradeupSettingsComponent
   */
  settingsForm: FormGroup;
  /**
   * List of available rarities (numeric value of enum)
   *
   * @type {number[]}
   * @memberof TradeupSettingsComponent
   */
  rarities: number[] = [
    WeaponRarity.Consumer,
    WeaponRarity.Industrial,
    WeaponRarity.MilSpec,
    WeaponRarity.Restricted,
    WeaponRarity.Classified,
  ];
  /**
   * Rarity enum. Used in markup for rarity value (name) display
   *
   * @memberof TradeupSettingsComponent
   */
  rarityEnum = WeaponRarity;
  /**
   * TODO:
   *
   * @type {Observable<boolean>}
   * @memberof TradeupSettingsComponent
   */
  isLoggedIn$: Observable<boolean>;
  /**
   * TODO:
   *
   * @type {Observable<InventoryItem[]>}
   * @memberof TradeupSettingsComponent
   */
  inventory$: Observable<InventoryItem[]>;
  /**
   * TODO:
   *
   * @private
   * @type {InventoryItem[]}
   * @memberof TradeupSettingsComponent
   */
  private storedInventoryItems: InventoryItem[] = [];
  /**
   * Subscription that watches for setting form value changes
   *
   * @memberof TradeupSettingsComponent
   */
  private settingChangeSubscription = Subscription.EMPTY;
  constructor(
    private formBuilder: FormBuilder,
    private userInfoService: UserInfoService,
    private inventoryService: InventoryService
  ) {
    this.createForm();
  }

  ngOnInit() {
    // this.isLoggedIn$ = this.userInfoService.getUserInfo()
    //   .pipe(
    //     map(userInfo => !!userInfo)
    //   );

    // this.setInventoryObservable();

    // Updating setting form
    this.settingsForm.patchValue(this.settings);

    // On input change
    this.settingChangeSubscription = this.settingsForm.valueChanges.subscribe((formSettings: TradeupSearchSettings) => {
      // // Enabling/Disabling stattrak toggle based on rarity
      // this.toggleDisableForStattrakControl(formSettings.rarity);

      // // Getting new inventory items for select when rarity or stattrak option changed
      // // because skins for select are based on these params
      // if (this.settings.rarity !== formSettings.rarity || this.settings.stattrak !== formSettings.stattrak) {
      //   this.setInventoryObservable();
      // }

      // Emitting new settings when they changed
      this.settingsChanged.emit(formSettings);
    });
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.settingChangeSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    // If collection list for search changed then clearing up previous selections
    // to prevent case of invalid collections remaining when settings have changed
    // NOTE: We are skipping initial change because form will contain initial values anyways AND...
    // ...AND we are checking that new collection list is not the same as before
    if (
      !changes.collections?.firstChange &&
      changes.collections?.currentValue[0]?.name !== changes.collections?.previousValue[0]?.name
    ) {
      this.settingsForm.patchValue({
        excludedCollections: [],
        includedCollections: [],
        primaryCollection: null,
      });
    }
    // NOTE: Doing the same as above but only for skins that have to be excluded from search
    if (
      !changes.skinsForSelect?.firstChange &&
      // Checking that we even have skins for select
      changes.skinsForSelect?.currentValue?.length &&
      // Checking if not same items are selected
      changes.skinsForSelect?.currentValue[0].name !== changes.skinsForSelect?.previousValue[0]?.name
    ) {
      this.settingsForm.patchValue({
        excludedSkins: [],
      });
    }
  }

  /**
   * Custom search function to remove dots from collection name (for easier search).
   * Mostly for "St. Marc" case
   *
   * @param {string} term Search term that user inputted
   * @param {Collection} item Current collection
   * @returns Returns found result
   * @memberof TradeupSettingsComponent
   */
  searchCollectionWithoutDot(term: string, item: Collection) {
    return (
      item.name
        .toLowerCase()
        // Searching if we have any matches (Replacing dots for easier search)
        .indexOf(term.toLowerCase().replace(/[.]/g, '')) !== -1
    );
  }

  // selectAll() {
  //   this.settingsForm.get('skinsFromInventory').setValue([...this.storedInventoryItems]);
  // }

  // compareItemsForSelect(item: InventoryItem, selected: InventoryItem) {
  //   // any logic to compare the objects and return true or false
  //   return item.item_name === selected.item_name && item.floatvalue === selected.floatvalue;
  // }

  /**
   * Method creates settings form
   *
   * @private
   * @memberof TradeupSettingsComponent
   */
  private createForm() {
    this.settingsForm = this.formBuilder.group({
      rarity: [null, Validators.required],
      stattrak: [false],
      maxCost: [100, Validators.required],
      maxTradeups: [20, Validators.required],
      compareWithoutTax: [true],
      difficulty: [0.5, [Validators.min(0.01), Validators.max(0.99)]],
      minVolume: [1],
      minEVPercent: [4],
      excludedCollections: [],
      includedCollections: [],
      primaryCollection: [null],
      excludedSkins: [],
      useSingleCollection: [false],
      skinsFromInventory: [],
      onlyInventory: [false],
      minSuccess: [0, [Validators.min(0), Validators.max(100)]],
      maxSuccess: [100, [Validators.min(0), Validators.max(100)]],
    });
  }

  // private setInventoryObservable() {
  //   console.log(`Setting inventory`);
  //   this.inventory$ = this.inventoryService.getInventory()
  //     .pipe(
  //       map(items => {
  //         return items.filter(item =>
  //           // Filtering by stattrak
  //           item.stattrak === this.settingsForm.get('stattrak').value &&
  //           // Filtering by matching rarity
  //           item.rarity === this.settingsForm.get('rarity').value
  //         );
  //       }),
  //       tap(items => {
  //         // Storing items for further reuse (to avoid extra requests)
  //         this.storedInventoryItems = items;

  //         // this.setInventoryItemsForSelect();
  //       }),
  //       shareReplay(1),
  //     );
  // }

  // /**
  //  * Method toggles stattrak control's `disable` state. If user seelected Industrial or Consumer rarity
  //  * then stattrak toggle become disabled
  //  *
  //  * @private
  //  * @param {WeaponRarity} selectedRarity Current rarity that is selected. Stattrak toggle disable state is decided on this value
  //  * @memberof TradeupSettingsComponent
  //  */
  // private toggleDisableForStattrakControl(selectedRarity: WeaponRarity) {
  //   // Storing stattrak control for quick access
  //   const stattrakControl = this.settingsForm.get('stattrak');
  //   // If user selected Industrial or Consumer rarity then we are disabling "Stattrak" toggle because
  //   // there are no stattrak weapons for these rarities. In other cases we are enabling it.
  //   // NOTE: Not emitting event because we are already in valueChange subscription and otherwise it would
  //   // create inifinte loop
  //   if (selectedRarity === WeaponRarity.Industrial || selectedRarity === WeaponRarity.Consumer) {
  //     stattrakControl.setValue(false, { emitEvent: false });
  //     stattrakControl.disable({ emitEvent: false });
  //   } else {
  //     stattrakControl.enable({ emitEvent: false });
  //   }
  // }
}

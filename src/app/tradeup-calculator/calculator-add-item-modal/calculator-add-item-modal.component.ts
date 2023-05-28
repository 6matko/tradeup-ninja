import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Weapon } from '@server/items';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../@core/auth.service';
import { SkinSortingOption, SortingDirection, SortingOption } from '../../base.model';
import { InventoryItem } from '../../inventory/inventory.model';
import { InventoryService } from '../../inventory/inventory.service';
import {
  getFloatIndexForPrice,
  getInventoryItemsForDisplay,
  getPrice,
} from '../../tradeup-search/tradeup-shared-utils';
import { StructuredCollectionWithItems } from '../../tradeup-search/tradeup.model';
import {
  CalculatorInputItem,
  CalculatorSortingOption,
  CollectionWithSkinsAndOutcomes,
} from '../tradeup-calculator.model';

@Component({
  selector: 'app-calculator-add-item-modal',
  templateUrl: './calculator-add-item-modal.component.html',
  styleUrls: ['./calculator-add-item-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorAddItemModalComponent implements OnInit, OnDestroy {
  /**
   * List with items for select
   *
   * @type {Weapon[]}
   * @memberof CalculatorAddItemModalComponent
   */
  itemsForSelect: Weapon[] = [];
  /**
   * Structurized collections with items
   *
   * @type {StructuredCollectionWithItems[]}
   * @memberof CalculatorAddItemModalComponent
   */
  structCollection: StructuredCollectionWithItems[];
  /**
   * Rarity value of input items
   *
   * @type {number}
   * @memberof CalculatorAddItemModalComponent
   */
  rarity: number;
  /**
   * Indicates if its Stattrak tradeup
   *
   * @type {boolean}
   * @memberof CalculatorAddItemModalComponent
   */
  stattrak: boolean;
  /**
   * List with items added to calculator (including empty slots)
   *
   * @type {CalculatorInputItem[]}
   * @memberof CalculatorAddItemModalComponent
   */
  itemsInCalculator: CalculatorInputItem[];
  /**
   * Selected weapon that will be used as tradeup input item
   *
   * @type {Weapon}
   * @memberof CalculatorAddItemModalComponent
   */
  selectedWeapon: Weapon;
  /**
   * Collections that are used for display
   *
   * @type {CollectionWithSkinsAndOutcomes[]}
   * @memberof CalculatorAddItemModalComponent
   */
  collectionsForDisplay: CollectionWithSkinsAndOutcomes[] = [];
  /**
   * Skins that are used for display in "Skins" tab
   *
   * @type {Weapon[]}
   * @memberof CalculatorAddItemModalComponent
   */
  skinsForDisplay: Weapon[] = [];
  /**
   * Flag indicates that inventory is being loaded. By default `true` (initial)
   *
   * @type {boolean}
   * @memberof CalculatorAddItemModalComponent
   */
  inventoryLoading: boolean = true;
  /**
   * Skins that are used for display in "Inventory" tab
   *
   * @type {InventoryItem[]}
   * @memberof CalculatorAddItemModalComponent
   */
  inventorySkinsForDisplay: InventoryItem[] = [];
  /**
   * Current selected tab ID.
   * **1** - Collections
   * **2** - Skins
   *
   * @type {number}
   * @memberof CalculatorAddItemModalComponent
   */
  currentTabId: number = 1;
  /**
   * Form group for trade up input item
   *
   * @type {FormGroup}
   * @memberof CalculatorAddItemModalComponent
   */
  inputItemForm: FormGroup;
  /**
   * Flag indicates if user is authenticated
   *
   * @type {boolean}
   * @memberof CalculatorAddItemModalComponent
   */
  userAuthenticated: boolean;
  /**
   * User's inventory
   *
   * @type {Observable<InventoryItem[]>}
   * @memberof CalculatorAddItemModalComponent
   */
  inventory$: Observable<InventoryItem[]>;
  /**
   * Float index based on current float
   *
   * @readonly
   * @memberof CalculatorAddItemModalComponent
   */
  get floatIndex() {
    return this.inputItemForm.get('floatIndex').value;
  }
  /**
   * Currently selected sorting options (state)
   *
   * @type {CalculatorSortingOption}
   * @memberof CalculatorAddItemModalComponent
   */
  selectedSorting: CalculatorSortingOption = new CalculatorSortingOption();
  /**
   * Stored inventory items
   *
   * @private
   * @type {InventoryItem[]}
   * @memberof CalculatorAddItemModalComponent
   */
  private storedInventoryItems: InventoryItem[] = [];
  /**
   * Stored list with all collections that can be used for current trade up and have outcomes
   *
   * @private
   * @type {CollectionWithSkinsAndOutcomes[]}
   * @memberof CalculatorAddItemModalComponent
   */
  private allCollectionsWithOutcomes: CollectionWithSkinsAndOutcomes[] = [];
  /**
   * Search subject that receives search input values
   *
   * @private
   * @type {Subject<string>}
   * @memberof CalculatorAddItemModalComponent
   */
  private searchSubject: Subject<string> = new Subject();
  /**
   * Subscription that watches for search subject value changes
   *
   * @private
   * @memberof CalculatorAddItemModalComponent
   */
  private searchSubjectSubscription = Subscription.EMPTY;
  /**
   * Subscription that watches for float input value change
   *
   * @private
   * @memberof CalculatorAddItemModalComponent
   */
  private floatValueChangeSubscription = Subscription.EMPTY;
  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private inventoryService: InventoryService
  ) {
    this.createForm();
    // Checking if user is authenticated
    this.userAuthenticated = this.authService.isAuthenticated();
    // Setting default value of skin sorting to keep it consistent. Otherwise its the only
    // tab without initial sorting value
    this.selectedSorting.skins.option = 'collection';
    this.selectedSorting.inventory.option = 'floatValue';
  }

  ngOnInit() {
    // Initializing first tab. We need to do this because we have
    // logic that gets collections for display. Casting to any because
    // we don't need all other properties
    this.changeTab({ nextId: this.currentTabId } as any);

    // Subscribing to float input value changes
    this.floatValueChangeSubscription = this.inputItemForm
      .get('float')
      .valueChanges.pipe(
        // Adding debounce time to prevent double execution and
        // update while user is still typing
        debounceTime(200)
      )
      .subscribe((float) => {
        // Storing float index based on float that is in input
        const floatIndex = getFloatIndexForPrice(float);
        // Setting float index on form based on float that is in input
        this.inputItemForm.get('floatIndex').setValue(floatIndex);
        // Since float has changed then we are taking into consideration that previouslly selected item IS NOT selection from
        // inventory because inventory item has specific float
        this.inputItemForm.get('inventoryItemId').setValue(null);
        // Marking view for check becausae our list for display has changed
        this.cdr.markForCheck();
      });

    // Subscribing to search input value changes
    this.searchSubjectSubscription = this.searchSubject
      .pipe(
        // Waiting 300ms before emitting. Used to prevent instant execution
        // while user can still be typing
        debounceTime(300),
        // Ignoring same value
        distinctUntilChanged()
      )
      .subscribe((searchValue) => {
        switch (this.currentTabId) {
          case 1:
            // Filtering collections by search value if we are in "Collections" tab
            this.filterCollectionsBySearchValue(searchValue);
            break;
          case 2:
            // Filtering skins by search value if we are in "Skins" tab
            this.filterSkinsBySearchValue(searchValue);
            break;
          case 3:
            // Filtering skins by search value if we are in "Inventory" tab
            this.filterInventoryItemsBySearchValue(searchValue);
            break;
          default:
            break;
        }
      });

    // If user is authenticated then we need to request users inventory
    if (this.userAuthenticated) {
      this.inventoryService
        .getInventory()
        .pipe(
          finalize(() => {
            // When request is over, disabling loading indicator
            this.inventoryLoading = false;
            this.cdr.markForCheck();
          }),
          shareReplay(1)
        )
        .subscribe((inventoryItems) => {
          // Storing inventory item origin
          this.storedInventoryItems = getInventoryItemsForDisplay(
            inventoryItems,
            [...this.getSkinsForDisplay()],
            this.itemsInCalculator,
            {
              rarity: this.rarity,
              stattrak: this.stattrak,
            }
          );

          // Storing inventory items for display and further manipulations
          this.inventorySkinsForDisplay = [...this.storedInventoryItems];
          // Manually disabling loading indicator in case if data was received from cache
          this.inventoryLoading = false;
          // Sorting inventory skins in case if they weren't received during initialization (first time)
          this.sortSkinsByStoredValue(true);
        });
    }
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.searchSubjectSubscription.unsubscribe();
    this.floatValueChangeSubscription.unsubscribe();
  }

  /**
   * Method selects skin and updates input item information
   *
   * @param {Weapon} skin Selected skin (Input item)
   * @param {InventoryItem} [inventoryItem] Optional inventory item. Should be passed if user selected skin from inventory
   * @memberof CalculatorInputItemComponent
   */
  selectSkin(skin: Weapon, inventoryItem?: InventoryItem) {
    // Adding validators for float input based on skin params
    this.inputItemForm.get('float').setValidators([
      // Setting that float is required because with "setValidators" we are assigning
      // new validators instead of appending
      Validators.required,
      // Setting min value depending on min float
      Validators.min(skin.min),
      // Setting max value depending on max float
      Validators.max(skin.max),
    ]);

    // Declaring initial values for form. If inventory item will be passed then we will initialize with those values
    let initialFloat;
    let initialFloatIndex;
    let initialPrice = 0;

    // If we passed inventory item then we have to initialize with value from this inventory item
    if (inventoryItem) {
      // Setting initial float based on inventory item
      initialFloat = inventoryItem.floatvalue;
      // Storing float index based on float that is in input
      initialFloatIndex = getFloatIndexForPrice(inventoryItem.floatvalue);
      // Getting current price for current item based on float from inventory
      initialPrice = getPrice(skin, inventoryItem.floatvalue, inventoryItem.stattrak);
    }

    // Resetting form with newly selected skin
    this.inputItemForm.reset(
      {
        inputItem: skin,
        price: initialPrice,
        float: initialFloat,
        floatIndex: initialFloatIndex,
        // Setting id of item to indicate that this item belongs to inventory
        inventoryItemId: inventoryItem?.floatid,
      },
      // Preventing event emission because we don't need to trigger value change detection.
      // Otherwise it would apply unneeded logic
      { emitEvent: false }
    );

    // Storing selected weapon for quick access
    this.selectedWeapon = skin;
    // Marking view for check because we have some changes for re-rendering
    this.cdr.markForCheck();
  }

  /**
   * Method selects skins from inventory
   *
   * @param {InventoryItem} selectedInventoryItem Item in inventory
   * @memberof CalculatorAddItemModalComponent
   */
  selectSkinFromInventory(selectedInventoryItem: InventoryItem) {
    // Creating name of skin without wear. We need it to search for skin among those that are used for tradeup search
    const searchNameWithoutWear = `${selectedInventoryItem.weapon_type} | ${selectedInventoryItem.item_name}`;
    // Searching for item based on name from inventory
    const foundItem = this.itemsForSelect.find((item) => item.name === searchNameWithoutWear);
    // If we found item by name then selecting it
    if (foundItem) {
      this.selectSkin(foundItem, selectedInventoryItem);
    }
  }

  /**
   * Method changes active tab
   *
   * @param {NgbNavChangeEvent} tabChangeEvent Ng-bootstrap tab change event
   * @memberof CalculatorAddItemModalComponent
   */
  changeTab(tabChangeEvent: NgbNavChangeEvent) {
    // Storing current tab ID
    this.currentTabId = tabChangeEvent.nextId;

    // Getting collections for display if user selected "Collections" tab
    if (this.currentTabId === 1 && !this.collectionsForDisplay?.length) {
      // Storing all collections that can be used for current trade up
      this.allCollectionsWithOutcomes = this.getCollectionsForDisplay(this.rarity);
      // Resetting collections for display
      this.collectionsForDisplay = [...this.allCollectionsWithOutcomes];

      // Sorting collections by selected direction (As its only option)
      this.sortCollectionsByOutcomes(this.selectedSorting.collections.direction);

      // Marking view for check because we have some changes for re-rendering
      this.cdr.markForCheck();
    } else if (this.currentTabId === 2) {
      // Storing skins for display based on items that are available for select via autocomplete dropdown
      this.skinsForDisplay = [...this.getSkinsForDisplay()];
      // Sorting skins by stored values to keep selected sorting even when data changes
      this.sortSkinsByStoredValue();
    } else {
      this.inventorySkinsForDisplay = [...this.storedInventoryItems];
      // Sorting skins by stored values to keep selected sorting even when data changes
      this.sortSkinsByStoredValue(true);
    }

    // Resetting search by providing empty value. We need to do this because there might be
    // cases where user searched for one value in one tab and wants to search for same in other.
    // Without this reset nothing will happen because we have "distinctUntilChanged" aka same
    // values won't be emitted for search
    this.search();
  }

  /**
   * Method emits search value to subject
   *
   * @param {string} searchValue Search value from input
   * @memberof CalculatorAddItemModalComponent
   */
  search(searchValue: string = '') {
    // Emitting search value to subject
    this.searchSubject.next(searchValue);
  }

  /**
   * Method confirms adding of input item and closes this modal with
   * selected input item for calculator
   *
   * @memberof CalculatorAddItemModalComponent
   */
  addItem() {
    // Closing modal and passing item that has to be added to trade up calculator
    this.activeModal.close(this.inputItemForm.value);
  }

  /**
   * Method sorts collections by outcome count
   *
   * @param {('asc' | 'desc')} [direction='asc'] direction Direction by which sorting should be done (ascending `asc` or descending `desc`).
   * By default `asc` aka Ascending
   * @memberof CalculatorAddItemModalComponent
   */
  sortCollectionsByOutcomes(direction: 'asc' | 'desc' = 'asc') {
    if (direction === SortingDirection.Ascending) {
      this.collectionsForDisplay = this.collectionsForDisplay.sort((a, b) => a.outcomes.length - b.outcomes.length);
      this.selectedSorting.collections.direction = SortingDirection.Ascending;
    } else {
      this.collectionsForDisplay = this.collectionsForDisplay.sort((a, b) => b.outcomes.length - a.outcomes.length);
      this.selectedSorting.collections.direction = SortingDirection.Descending;
    }
    // Storing currently selected sorting options to use them when data changes
    this.selectedSorting.collections.option = 'outcomes';
    // Marking view for check because collection list changed
    this.cdr.markForCheck();
  }

  /**
   * Method sorts skins by specific options.
   * **1** - by lowest float cap
   * **2** - by highest float cap
   * **3** - by skin name (asc)
   * **4** - by collection name (asc)
   * **5** - by float value in inventory (asc)
   * **6** - by float value in inventory (desc)
   *
   * @param {number} option
   * @memberof CalculatorAddItemModalComponent
   */
  sortSkinsByOption(option: number) {
    switch (option) {
      // Sorting by lowest float cap
      case 1:
        this.skinsForDisplay = this.skinsForDisplay.sort((a, b) => a.max - b.max);
        this.storeSkinSortingOption({ option: 'floatCap', direction: SortingDirection.Ascending });
        break;
      // Sorting by highest float cap
      case 2:
        this.skinsForDisplay = this.skinsForDisplay.sort((a, b) => b.max - a.max);
        this.storeSkinSortingOption({ option: 'floatCap', direction: SortingDirection.Descending });
        break;
      // Sorting by skin name (asc)
      case 3:
        this.skinsForDisplay = this.skinsForDisplay.sort((a, b) => {
          // Src: https://stackoverflow.com/a/6712080/5347059
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        this.storeSkinSortingOption({ option: 'name', direction: SortingDirection.Ascending });
        break;
      // Sorting by collection name (asc)
      case 4:
        this.skinsForDisplay = this.skinsForDisplay.sort((a, b) => {
          // Src: https://stackoverflow.com/a/6712080/5347059
          if (a.collection.name < b.collection.name) {
            return -1;
          }
          if (a.collection.name > b.collection.name) {
            return 1;
          }
          return 0;
        });
        this.storeSkinSortingOption({ option: 'collection', direction: SortingDirection.Ascending });
        break;
      // Sorting by lowest float value
      case 5:
        this.inventorySkinsForDisplay = this.inventorySkinsForDisplay.sort((a, b) => a.floatvalue - b.floatvalue);
        this.storeSkinSortingOption({ option: 'floatValue', direction: SortingDirection.Ascending }, true);
        break;
      // Sorting by highest float value
      case 6:
        this.inventorySkinsForDisplay = this.inventorySkinsForDisplay.sort((a, b) => b.floatvalue - a.floatvalue);
        this.storeSkinSortingOption({ option: 'floatValue', direction: SortingDirection.Descending }, true);
        break;
      default:
        break;
    }
    // Marking view for check because collection list changed
    this.cdr.markForCheck();
  }

  /**
   * Method stores sorting options for skins
   *
   * @private
   * @param {SortingOption<SkinSortingOption>} options Sorting options to store
   * @param {boolean} [inventory] Indicates if sorting should be stored for inventory skins
   * @memberof CalculatorAddItemModalComponent
   */
  private storeSkinSortingOption(options: SortingOption<SkinSortingOption>, inventory?: boolean) {
    // Storing currently selected sorting options to use them when data changes
    if (inventory) {
      this.selectedSorting.inventory = options;
    } else {
      this.selectedSorting.skins = options;
    }
  }

  /**
   * Method filters collections by search value (collection name)
   *
   * @private
   * @param {string} searchValue Collection name by which collections should be filtered
   * @memberof CalculatorAddItemModalComponent
   */
  private filterCollectionsBySearchValue(searchValue: string) {
    this.collectionsForDisplay = this.allCollectionsWithOutcomes
      .filter(
        (col) =>
          // Filtering by collection name
          col.collection.skins[0].collection.name
            // Making lower cased for easier search
            .toLowerCase()
            // Removing dot for easier search (St. Marc case)
            .replace(/[.]/g, '')
            // Searching for term (Also removing dot from search term in order to get proper result)
            .includes(searchValue.toLowerCase().replace(/[.]/g, '')) ||
          // Or by skin name that is in collection
          col.collection.skins.filter((skin) =>
            skin.name
              .toLowerCase()
              // Removing dot for easier search (St. Marc case)
              .replace(/[.]/g, '')
              // Searching for term (Also removing dot from search term in order to get proper result)
              .includes(searchValue.toLowerCase().replace(/[.]/g, ''))
          ).length ||
          // Or by outcome skin name that is in collection
          col.outcomes.filter((skin) =>
            skin.name
              .toLowerCase()
              // Removing dot for easier search (St. Marc case)
              .replace(/[.]/g, '')
              // Searching for term (Also removing dot from search term in order to get proper result)
              .includes(searchValue.toLowerCase().replace(/[.]/g, ''))
          ).length
      )
      // Taking only those collections that comply stattrak criteria.
      // This is needed to avoid case where non-stattrak items are present in collections
      .filter((col) => !this.stattrak || col.collection.skins[0].stattrak === this.stattrak);

    // Sorting collections by selected direction (As its only option)
    this.sortCollectionsByOutcomes(this.selectedSorting.collections.direction);

    // Marking view for check becausae our list for display has changed
    this.cdr.markForCheck();
  }

  /**
   * Method filters dispalyed skins by skin or collection name
   *
   * @private
   * @param {string} searchValue Search value for skin or collection name
   * @memberof CalculatorAddItemModalComponent
   */
  private filterSkinsBySearchValue(searchValue: string) {
    // Filtering skins by search value depending on skin name or collection name
    this.skinsForDisplay = this.itemsForSelect
      .filter(
        (skin) =>
          // Searching for skin that includes search value in its name
          skin.name
            .toLowerCase()
            // Removing dot for easier search (St. Marc case)
            .replace(/[.]/g, '')
            // Searching for term (Also removing dot from search term in order to get proper result)
            .includes(searchValue.toLowerCase().replace(/[.]/g, '')) ||
          // Or searching for collection which includes search value in its name
          skin.collection.name
            .toLowerCase()
            // Removing dot for easier search (St. Marc case)
            .replace(/[.]/g, '')
            // Searching for term (Also removing dot from search term in order to get proper result)
            .includes(searchValue.toLowerCase().replace(/[.]/g, ''))
      )
      // Taking skins based on stattrak criteria
      .filter((skin) => !this.stattrak || Boolean(skin.stattrak) === this.stattrak);

    // Sorting skins by stored values to keep selected sorting even when data changes
    this.sortSkinsByStoredValue();

    // Marking view for check becausae our list for display has changed
    this.cdr.markForCheck();
  }

  /**
   * Method performs skin filtering based on stored sorting
   *
   * @private
   * @param {boolean} [inventory] Indicates if we should work with inventory sorting. If `false` then with skins
   * @memberof CalculatorAddItemModalComponent
   */
  private sortSkinsByStoredValue(inventory?: boolean) {
    // If its inventory then taking inventory value. Otherwise working as skins
    const selectedSorting = this.selectedSorting[inventory ? 'inventory' : 'skins'];
    // Defining if sorting should be done Ascending. We need this only for quick accesss
    const sortAsc = selectedSorting.direction === SortingDirection.Ascending;

    switch (selectedSorting.option) {
      case 'floatCap':
        // Selecting option based on sorting direction
        this.sortSkinsByOption(sortAsc ? 1 : 2);
        break;
      case 'name':
        this.sortSkinsByOption(3);
        break;
      case 'collection':
        this.sortSkinsByOption(4);
        break;
      case 'floatValue':
        // Selecting option based on sorting direction
        this.sortSkinsByOption(sortAsc ? 5 : 6);
        break;
      default:
        break;
    }
  }

  /**
   * Method filters dispalyed skins in inventory by skin name
   *
   * @private
   * @param {string} searchValue Search value for skin or collection name
   * @memberof CalculatorAddItemModalComponent
   */
  private filterInventoryItemsBySearchValue(searchValue: string) {
    // Filtering skins by search value depending on skin name or collection name
    this.inventorySkinsForDisplay = this.storedInventoryItems
      .filter((item) =>
        // Searching for skin that includes search value in its name
        item.full_item_name.toLowerCase().includes(searchValue.toLowerCase())
      )
      // Taking skins based on stattrak criteria
      .filter((item) => !this.stattrak || Boolean(item.stattrak) === this.stattrak);

    // Sorting skins by stored values to keep selected sorting even when data changes
    this.sortSkinsByStoredValue(true);

    // Marking view for check becausae our list for display has changed
    this.cdr.markForCheck();
  }

  /**
   * Method returns skins for display
   *
   * @private
   * @returns Returns skins for display
   * @memberof CalculatorAddItemModalComponent
   */
  private getSkinsForDisplay() {
    return this.itemsForSelect.filter((skin) => !this.stattrak || Boolean(skin.stattrak) === this.stattrak);
  }

  /**
   * Method creates list with collections that are available for current rarity. This list contains outcome items as welll
   *
   * @private
   * @param {number} rarity Rarity for which collections should be gathered for
   * @returns {CollectionWithSkinsAndOutcomes[]} Returns list with collections for display and outcome list
   * @memberof CalculatorAddItemModalComponent
   */
  private getCollectionsForDisplay(rarity: number): CollectionWithSkinsAndOutcomes[] {
    // List with all collections with skin info and outcomes
    const collections: CollectionWithSkinsAndOutcomes[] = [];

    // Walking through every collection
    for (const collection of this.structCollection) {
      // Storing skins of current rarity for current collection. Used for quick access
      const currentRaritySkins = collection.items[rarity];

      // If we have skins for current rarity then gathering other necessary information.
      // Otherwise skipping this collection
      if (currentRaritySkins && (!this.stattrak || currentRaritySkins.skins[0].stattrak === this.stattrak)) {
        // Getting next rarity
        const nextRarity = collection.items[rarity + 1];

        // If next rarity has skins aka outcomes then adding it to found collections
        if (nextRarity?.skins?.length) {
          // Storing list with collection outcomes
          const outcomes = [...nextRarity.skins];

          // Adding found collection with outcomes to all collection list
          collections.push({ collection: collection.items[rarity], outcomes });
        }
      }
    }
    // Returning created list with colllections for next rarity that can be used for display
    return collections;
  }

  /**
   * Method ccreates form form input item
   *
   * @private
   * @memberof CalculatorAddItemModalComponent
   */
  private createForm() {
    this.inputItemForm = this.formBuilder.group({
      inputItem: [null, Validators.required],
      float: [null],
      price: [0, [Validators.required, Validators.min(0)]],
      floatIndex: [null],
      // ID of item to indicate if item was added from inventory
      inventoryItemId: [null],
    });
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Weapon } from '@server/items';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, shareReplay } from 'rxjs/operators';
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
  selector: 'app-calculator-add-multiple-inventory-modal',
  templateUrl: './calculator-add-multiple-inventory-modal.component.html',
  styleUrls: ['./calculator-add-multiple-inventory-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorAddMultipleInventoryModalComponent implements OnInit, OnDestroy {
  /**
   * List with items for select
   *
   * @type {Weapon[]}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  itemsForSelect: Weapon[] = [];
  /**
   * Structurized collections with items
   *
   * @type {StructuredCollectionWithItems[]}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  structCollection: StructuredCollectionWithItems[];
  /**
   * Rarity value of input items
   *
   * @type {number}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  rarity: number;
  /**
   * Indicates if its Stattrak tradeup
   *
   * @type {boolean}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  stattrak: boolean;
  /**
   * List with items added to calculator (including empty slots)
   *
   * @type {CalculatorInputItem[]}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  itemsInCalculator: CalculatorInputItem[];
  /**
   * Collections that are used for display
   *
   * @type {CollectionWithSkinsAndOutcomes[]}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  collectionsForDisplay: CollectionWithSkinsAndOutcomes[] = [];
  /**
   * Flag indicates that inventory is being loaded. By default `true` (initial)
   *
   * @type {boolean}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  inventoryLoading: boolean = true;
  /**
   * Skins that are used for display in "Inventory" tab
   *
   * @type {InventoryItem[]}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  inventorySkinsForDisplay: InventoryItem[] = [];
  /**
   * User's inventory
   *
   * @type {Observable<InventoryItem[]>}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  inventory$: Observable<InventoryItem[]>;
  /**
   * Currently selected sorting options (state)
   *
   * @type {CalculatorSortingOption}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  selectedSorting: CalculatorSortingOption = new CalculatorSortingOption();
  selectedItems: CalculatorInputItem[] = [];
  /**
   * Amount of free slots available for select in calculator. Used to indicate how many items user can select
   *
   * @type {number}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  amountOfFreeSlotsInCalculator: number;
  /**
   * Flag indicates if shake animation should be displayed on "Selected" items to indicate user
   * that he already selected all possible items
   *
   * @type {boolean}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  showShakeAnimation: boolean = false;
  /**
   * Stored inventory items
   *
   * @private
   * @type {InventoryItem[]}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  private storedInventoryItems: InventoryItem[] = [];
  /**
   * Search subject that receives search input values
   *
   * @private
   * @type {Subject<string>}
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  private searchSubject: Subject<string> = new Subject();
  /**
   * Subscription that watches for search subject value changes
   *
   * @private
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  private searchSubjectSubscription = Subscription.EMPTY;
  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private inventoryService: InventoryService
  ) {
    // Setting default value of skin sorting to keep it consistent. Otherwise its the only
    // tab without initial sorting value
    this.selectedSorting.inventory.option = 'floatValue';
  }

  ngOnInit() {
    // Getting amount of free slots taht are currently available in calculator
    this.amountOfFreeSlotsInCalculator = 10 - this.itemsInCalculator.filter((item) => item?.inputItem?.name).length;

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
        // Filtering skins by search value if we are in "Inventory" tab
        this.filterInventoryItemsBySearchValue(searchValue);
      });

    // Getting user inventory
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

        // Storing inventory items for display and further manipulations. With parse, stringify
        // getting rid of references for other components
        this.inventorySkinsForDisplay = JSON.parse(JSON.stringify(this.storedInventoryItems));
        // Manually disabling loading indicator in case if data was received from cache
        this.inventoryLoading = false;
        // Sorting inventory skins in case if they weren't received during initialization (first time)
        this.sortSkinsByStoredValue(true);
      });
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.searchSubjectSubscription.unsubscribe();
  }

  /**
   * Method selects skins from inventory
   *
   * @param {InventoryItem} selectedInventoryItem Item in inventory
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  selectSkinFromInventory(selectedInventoryItem: InventoryItem) {
    // Creating name of skin without wear. We need it to search for skin among those that are used for tradeup search
    const searchNameWithoutWear = `${selectedInventoryItem.weapon_type} | ${selectedInventoryItem.item_name}`;
    // Searching for item based on name from inventory
    const foundItem = this.itemsForSelect.find((item) => item.name === searchNameWithoutWear);

    // Setting initial index of selected item
    let indexOfItemInSelectedList = -1;
    // If selected inventory item doesn't have float id then index of selected item will remain "-1" aka
    // this item was not selected. This is to avoid cases where some items weren't being selected for some reason
    if (selectedInventoryItem.floatid) {
      // Getting index of currently clicked item among previously selected ones. If this item is not found then it means
      // that this particular item was not previously selected
      indexOfItemInSelectedList = this.selectedItems.findIndex(
        (item) => item.inventoryItemId === selectedInventoryItem.floatid
      );
    }

    // If we found item by name then selecting it
    if (foundItem) {
      // If item was not found then placing selection on it
      if (indexOfItemInSelectedList === -1) {
        this.selectSkin(foundItem, selectedInventoryItem);
      } else {
        // Since we are de-selecting this item we have to visually remove selection
        selectedInventoryItem.selected = false;
        this.deSelectSkin(indexOfItemInSelectedList);
      }
    }
  }

  /**
   * Method emits search value to subject
   *
   * @param {string} searchValue Search value from input
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  search(searchValue: string = '') {
    // Emitting search value to subject
    this.searchSubject.next(searchValue);
  }

  /**
   * Method confirms adding of input item and closes this modal with
   * selected input item for calculator
   *
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  addItems() {
    console.log(`Close and pass selected items`);
    // Closing modal and passing item that has to be added to trade up calculator
    this.activeModal.close(this.selectedItems);
  }

  /**
   * Method sorts collections by outcome count
   *
   * @param {('asc' | 'desc')} [direction='asc'] direction Direction by which sorting should be done (ascending `asc` or descending `desc`).
   * By default `asc` aka Ascending
   * @memberof CalculatorAddMultipleInventoryModalComponent
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
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  sortSkinsByOption(option: number) {
    switch (option) {
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
   * Method selects skin and updates input item information
   *
   * @param {Weapon} skin Selected skin (Input item)
   * @param {InventoryItem} [inventoryItem] Optional inventory item. Should be passed if user selected skin from inventory
   * @memberof CalculatorInputItemComponent
   */
  private selectSkin(skin: Weapon, inventoryItem: InventoryItem) {
    // If amount of selected items is same as free slots in calculator, preventing further selection
    if (this.selectedItems.length === this.amountOfFreeSlotsInCalculator) {
      this.showShakeAnimation = true;
      // After 300ms (duration of animation) removing shake animation so user could trigger it again
      setTimeout(() => {
        this.showShakeAnimation = false;
        this.cdr.markForCheck();
      }, 300);
      return;
    } else {
      this.showShakeAnimation = false;
    }
    this.cdr.markForCheck();

    // Setting initial float based on inventory item
    const initialFloat = inventoryItem.floatvalue;
    // Storing float index based on float that is in input
    const initialFloatIndex = getFloatIndexForPrice(inventoryItem.floatvalue);
    // Getting current price for current item based on float from inventory
    const initialPrice = getPrice(skin, inventoryItem.floatvalue, this.stattrak);

    this.selectedItems.push({
      inputItem: skin,
      price: initialPrice,
      float: initialFloat,
      floatIndex: initialFloatIndex,
      // Setting id of item to indicate that this item belongs to inventory
      inventoryItemId: inventoryItem?.floatid ?? null,
    });

    // Setting visual selection on this item
    inventoryItem.selected = true;

    // Marking view for check because we have some changes for re-rendering
    this.cdr.markForCheck();
  }

  /**
   * Method removes selection from item
   *
   * @private
   * @param {number} index Index of currently selected item. Selection will be removed from it
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  private deSelectSkin(index: number) {
    this.selectedItems.splice(index, 1);
    this.showShakeAnimation = false;
    this.cdr.markForCheck();
  }

  /**
   * Method stores sorting options for skins
   *
   * @private
   * @param {SortingOption<SkinSortingOption>} options Sorting options to store
   * @param {boolean} [inventory] Indicates if sorting should be stored for inventory skins
   * @memberof CalculatorAddMultipleInventoryModalComponent
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
   * Method performs skin filtering based on stored sorting
   *
   * @private
   * @param {boolean} [inventory] Indicates if we should work with inventory sorting. If `false` then with skins
   * @memberof CalculatorAddMultipleInventoryModalComponent
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
   * @memberof CalculatorAddMultipleInventoryModalComponent
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
   * @memberof CalculatorAddMultipleInventoryModalComponent
   */
  private getSkinsForDisplay() {
    return this.itemsForSelect.filter((skin) => !this.stattrak || Boolean(skin.stattrak) === this.stattrak);
  }
}

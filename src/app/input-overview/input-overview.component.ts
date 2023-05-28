import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { RootObject, Weapon } from '@server/items';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { TradeupSearchService } from '../tradeup-search/tradeup-search.service';
import { SortedInputDictionary } from './input-overview.model';

@Component({
  selector: 'app-input-overview',
  templateUrl: './input-overview.component.html',
  styleUrls: ['./input-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOverviewComponent implements OnInit {
  /**
   * Text by which we should filter sorted items
   *
   * @type {string}
   * @memberof InputOverviewComponent
   */
  filterText: string = '';
  /**
   * Sorted items for display
   *
   * @type {SortedInputDictionary[]}
   * @memberof InputOverviewComponent
   */
  sortedItemsForDisplay: SortedInputDictionary[] = [];
  /**
   * Id of current tab. Tab id is rarity value
   *
   * @type {number}
   * @memberof InputOverviewComponent
   */
  currentTabId: number = 1;
  /**
   * Flag indicates if loading indicator is shown
   *
   * @type {boolean}
   * @memberof InputOverviewComponent
   */
  isLoading: boolean = true;
  /**
   * Stored items form server
   *
   * @private
   * @type {RootObject}
   * @memberof InputOverviewComponent
   */
  private items: RootObject;
  /**
   * Original list of sorted items to display
   *
   * @private
   * @type {SortedInputDictionary[]}
   * @memberof InputOverviewComponent
   */
  private sortedItems: SortedInputDictionary[] = [];
  constructor(
    private tradeupSearchService: TradeupSearchService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Requesting item data
    this.getItems();
  }

  /**
   * Method changes tab and stores current tab ID
   *
   * @param {NgbNavChangeEvent} tabChangeEvent Ng-bootstrap tab change event
   * @memberof InputOverviewComponent
   */
  changeTab(tabId: NgbNavChangeEvent) {
    this.currentTabId = tabId.nextId;
    // Filtering with empty value since we changed tab (rarity).
    // This is needed for better UX in case if user forgets to clear search input
    this.filter('');
  }

  /**
   * Method filters sorted items by provided search text
   *
   * @param {string} [filterText=''] Search aka filter text by which items will be filtered
   * @memberof InputOverviewComponent
   */
  filter(filterText: string = '') {
    // Filtering only if we have items
    if (this.sortedItems.length) {
      // Storing new filtering text
      this.filterText = filterText;
      // Getting sorted items for specific rarity (For quick access)
      const rarityItems = this.sortedItems[this.currentTabId.toString()];
      // Storing filter text in lower case for quick access. (Removing dots to easen the search)
      const filterTextLowerCase = filterText.toLowerCase().replace(/[.]/g, '');
      // Sorting items by search text and storing them to display only list
      this.sortedItemsForDisplay = rarityItems.filter(
        (item: Weapon) =>
          // Filtering by skin name and collection name
          item.name
            .toLowerCase()
            // Removing dot for easier search (St. Marc case)
            .replace(/[.]/g, '')
            // Searching for term
            .includes(filterTextLowerCase) ||
          item.collection.name
            // Making lower cased for easier search
            .toLowerCase()
            // Removing dot for easier search (St. Marc case)
            .replace(/[.]/g, '')
            // Searching for term
            .includes(filterTextLowerCase)
      );
    }
  }

  /**
   * Method gets items for search and stores them
   *
   * @private
   * @memberof InputOverviewComponent
   */
  private getItems() {
    // Requesting items for search and starting search
    this.tradeupSearchService
      .getItems()
      .pipe(
        // Disabling loading indicator when request is oveer
        finalize(() => (this.isLoading = false))
      )
      .subscribe(
        (data) => {
          // Storing received data (items)
          this.items = data;

          this.sortItems();

          // Marking view for re-render since we have ngIf's relying on stored items
          this.cdr.markForCheck();
        },
        (err) => {
          // Just in case, clearing stored item
          this.items = undefined;
          this.toastr.error(null, 'Could not load items');
        }
      );
  }

  /**
   * Method sorts items by lowest MAX Float range and groups them by rarity
   *
   * @private
   * @memberof InputOverviewComponent
   */
  private sortItems() {
    const byRarityArr: any[] = [];
    Object.values(this.items.weapons)
      .sort((a, b) => a.max - b.max)
      .forEach((item) => {
        if (byRarityArr[item.rarity.value]) {
          byRarityArr[item.rarity.value].push(item);
        } else {
          byRarityArr[item.rarity.value] = [item];
        }
      });
    // Storing sorted items
    this.sortedItems = byRarityArr;
    // Filtering content (initially)
    this.filter();
  }
}

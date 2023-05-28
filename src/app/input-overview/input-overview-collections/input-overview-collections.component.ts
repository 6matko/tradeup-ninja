import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CollectionsWithSkin, RootObject } from '@server/items';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { TradeupSearchService } from '../../tradeup-search/tradeup-search.service';

@Component({
  selector: 'app-input-overview-collections',
  templateUrl: './input-overview-collections.component.html',
  styleUrls: ['./input-overview-collections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOverviewCollectionsComponent implements OnInit {
  /**
   * Flag indicates if loading indicator is shown
   *
   * @type {boolean}
   * @memberof InputOverviewCollectionsComponent
   */
  isLoading: boolean = true;
  /**
   * Collections with skins for display
   *
   * @type {CollectionsWithSkin[]}
   * @memberof InputOverviewCollectionsComponent
   */
  collectionsForDisplay: CollectionsWithSkin[] = [];
  /**
   * Text by which we should filter sorted items
   *
   * @type {string}
   * @memberof InputOverviewComponent
   */
  filterText: string = '';
  /**
   * Stored items form server
   *
   * @private
   * @type {RootObject}
   * @memberof InputOverviewCollectionsComponent
   */
  private items: RootObject;
  /**
   * Original list of collections to display
   *
   * @private
   * @type {CollectionsWithSkin[]}
   * @memberof InputOverviewCollectionsComponent
   */
  private collections: CollectionsWithSkin[] = [];
  constructor(
    private tradeupSearchService: TradeupSearchService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getItems();
  }

  /**
   * Method filters collections by provided search text
   *
   * @param {string} [filterText=''] Search aka filter text by which items will be filtered
   * @memberof InputOverviewCollectionsComponent
   */
  filter(filterText: string = '') {
    // Filtering only if we have items
    if (this.collections.length) {
      // Storing new filtering text
      this.filterText = filterText;

      // Storing filter text in lower case for quick access (Removing dots to easen the search)
      const filterTextLowerCase = filterText.toLowerCase().replace(/[.]/g, '');
      // Sorting items by search text and storing them to display only list
      this.collectionsForDisplay = Object.values(this.collections).filter(
        (col) =>
          // Filtering by collection name OR by skin name (Removing dots to easen the search)
          col.name?.toLowerCase().replace(/[.]/g, '').includes(filterTextLowerCase) ||
          // Searching for skin in specific collection. For example user wants to find in which collection
          // is "fade" item (Removing dots to easen the search)
          col.items?.filter((skin) => skin.fullName.toLowerCase().replace(/[.]/g, '').includes(filterTextLowerCase))
            .length
      );
    }
  }

  /**
   * Method gets items for search and stores them
   *
   * @private
   * @memberof InputOverviewCollectionsComponent
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

          this.collections = Object.values(data.collectionsWithSkins);
          // Performing initial filtering
          this.filter();

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
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Weapon } from '@server/items';

@Component({
  selector: 'app-input-overview-collection-display',
  templateUrl: './input-overview-collection-display.component.html',
  styleUrls: ['./input-overview-collection-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOverviewCollectionDisplayComponent implements OnInit {
  /**
   * Flag indicates if something is being loaded
   *
   * @type {boolean}
   * @memberof InputOverviewCollectionDisplayComponent
   */
  isLoading: boolean = true;
  /**
   * Error message if something went wrong
   *
   * @type {string}
   * @memberof InputOverviewCollectionDisplayComponent
   */
  error: string = '';
  /**
   * Collections with skins for display
   *
   * @type {Weapon[]}
   * @memberof InputOverviewCollectionDisplayComponent
   */
  collectionWithSkinsForDisplay: Weapon[];
  /**
   * Current collection name for display
   *
   * @type {string}
   * @memberof InputOverviewCollectionDisplayComponent
   */
  collectionName: string;
  /**
   * Text by which we should filter collection items
   *
   * @type {string}
   * @memberof InputOverviewCollectionDisplayComponent
   */
  filterText: string = '';
  /**
   * Stored skins for current collection
   *
   * @private
   * @type {Weapon[]}
   * @memberof InputOverviewCollectionDisplayComponent
   */
  private collectionSkins: Weapon[];
  constructor(private cdr: ChangeDetectorRef, private route: ActivatedRoute) {}

  ngOnInit() {
    // Storing data from resolver (quick access)
    const collectionSkinsFromResolver = this.route.snapshot.data.collectionSkins;
    // If we got an error then displaying it
    if (collectionSkinsFromResolver.error) {
      this.error = collectionSkinsFromResolver.error;
    } else {
      // Storing data from resolver for display
      this.collectionSkins = collectionSkinsFromResolver;
      // Storing current collection name for display
      this.collectionName = this.collectionSkins[0].collection.name;
      // Performnig initial filtering
      this.filter();
    }
    // Disabling loading indicator when
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  /**
   * Method filters collections by provided search text
   *
   * @param {string} [filterText=''] Search aka filter text by which items will be filtered
   * @memberof InputOverviewCollectionsComponent
   */
  filter(filterText: string = '') {
    // Filtering only if we have items
    if (this.collectionSkins.length) {
      // Storing new filtering text
      this.filterText = filterText;

      // Storing filter text in lower case for quick access (Removing dots to easen the search)
      const filterTextLowerCase = filterText.toLowerCase().replace(/[.]/g, '');
      // Sorting items by search text and storing them to display only list
      this.collectionWithSkinsForDisplay = this.collectionSkins
        .filter((skin) =>
          // Filtering by skin name
          skin.name?.toLowerCase().replace(/[.]/g, '').includes(filterTextLowerCase)
        )
        // Ordering by rarity ASC
        .sort((a, b) => a.rarity.value - b.rarity.value);
    }
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Weapon } from '@server/items';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-skin-select-autocomplete',
  templateUrl: './skin-select-autocomplete.component.html',
  styleUrls: ['./skin-select-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkinSelectAutocompleteComponent implements OnInit {
  /**
   * List with all skins for typeahead aka autocomplete
   *
   * @type {Weapon[]}
   * @memberof SkinSelectAutocompleteComponent
   */
  @Input() allSkins: Weapon[];
  /**
   * Indicates if simple search display template should be used (Default one, without images). If `false` then
   * custom template will be used with skin images
   *
   * @type {boolean}
   * @memberof SkinSelectAutocompleteComponent
   */
  @Input() simple: boolean;
  /**
   * Limit for display in autocomplete. By default `10` which means max 10 results will be shown
   *
   * @type {number}
   * @memberof SkinSelectAutocompleteComponent
   */
  @Input() displayLimit: number = 10;
  /**
   * Input height in pixels
   *
   * @type {number}
   * @memberof SkinSelectAutocompleteComponent
   */
  @Input() inputHeightPx: number;
  /**
   * Index of "TAB" key priority. By default "0" aka default tab index. If "1" then
   * it will be first priority after user uses "TAB" on input
   *
   * @type {number}
   * @memberof SkinSelectAutocompleteComponent
   */
  @Input() tabIndex: number = 0;
  /**
   * Indicates if collection name should be also shown in results
   *
   * @type {boolean}
   * @memberof SkinSelectAutocompleteComponent
   */
  @Input() showCollectionName: boolean;
  /**
   * Emitter that emits selected skin
   *
   * @type {EventEmitter<Weapon>}
   * @memberof SkinSelectAutocompleteComponent
   */
  @Output() skinSelected: EventEmitter<Weapon> = new EventEmitter();
  /**
   * Currently selected skin name. Used only for display
   *
   * @type {Weapon}
   * @memberof SkinSelectAutocompleteComponent
   */
  selectedSkinName: Weapon;
  constructor() {}

  ngOnInit() {}

  /**
   * Method selects outcome from typeahead
   *
   * @param {NgbTypeaheadSelectItemEvent} foundItem Found aka selected item
   * @memberof SkinSelectAutocompleteComponent
   */
  selectInputItem(foundItem: NgbTypeaheadSelectItemEvent) {
    // Storing name of currently selected skin
    this.selectedSkinName = foundItem.item.name;
    // Emitting selected item
    this.skinSelected.emit(foundItem.item);
  }

  /**
   * Method that searches for skin by search term
   *
   * @memberof SkinSelectAutocompleteComponent
   */
  searchSkin = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2
          ? []
          : this.allSkins
              .filter(
                (skin) =>
                  skin.name
                    // Removing "|" from search result because it makes search a little bit harder for users.
                    // NOTE: There is a space after | because we need to remove it as well, otherwise skin name would be like this:
                    // "AWP  BOOM" aka extra space
                    .replace('| ', '')
                    // Converting to lowercase in order to compare
                    .toLowerCase()
                    // Replacing all dots for easier search
                    .replace(/[.]/g, '')
                    // Searching if we have any matches (Replacing dots for easier search)
                    .indexOf(term.toLowerCase().replace(/[.]/g, '')) > -1
              )
              // Displaying first N elements
              .slice(0, this.displayLimit)
      )
    );

  /**
   * Method formats results to display skin name
   *
   * @memberof SkinSelectAutocompleteComponent
   */
  formatter = (x: Weapon) => x.name;
}

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { RootObject, Weapon } from '@server/items';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SharedTradeupService } from '../../@shared/shared-tradeup/shared-tradeup.service';
import { TradeupSearchService } from '../../tradeup-search/tradeup-search.service';
import { calculateTradeUp, structurizeItemByCollection } from '../../tradeup-search/tradeup-search.utils';
import { getAllSkins } from '../../tradeup-search/tradeup-shared-utils';
import { TradeupItemWithFloat, TradeupSummary } from '../../tradeup-search/tradeup.model';
import { UserPreferencesLoaderService } from '../../user-preferences/user-preferences-loader.service';
import { UserPreferences } from '../../user-preferences/user-preferences.model';
import { TradeupResult, TradeupResultOutcome, TradeupResultSummary } from '../tradeup-result.model';

@Component({
  selector: 'app-add-edit-result-modal',
  templateUrl: './add-edit-result-modal.component.html',
  styleUrls: ['./add-edit-result-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditResultModalComponent implements OnInit, OnDestroy {
  /**
   * Tradeup form
   *
   * @type {FormGroup}
   * @memberof AddEditResultModalComponent
   */
  tradeupForm: FormGroup;
  /**
   * Form array with input items
   *
   * @type {FormArray}
   * @memberof AddEditResultModalComponent
   */
  inputItems: FormArray;
  /**
   * List with all skins for typeahead aka autocomplete
   *
   * @type {Weapon[]}
   * @memberof AddEditResultModalComponent
   */
  allSkins: Weapon[];
  /**
   * Tradeup summary
   *
   * @type {TradeupResultSummary}
   * @memberof AddEditResultModalComponent
   */
  summary: TradeupResultSummary = new TradeupResultSummary();
  /**
   * Passed result (from parent component) that has to be modified
   *
   * @type {TradeupResult}
   * @memberof AddEditResultModalComponent
   */
  resultForEdit: TradeupResult;
  /**
   * Price that was copied
   *
   * @private
   * @type {number}
   * @memberof AddEditResultModalComponent
   */
  copiedPrice: number = 0;
  /**
   * Skin name that was copied
   *
   * @private
   * @type {string}
   * @memberof AddEditResultModalComponent
   */
  copiedSkinName: string = '';
  /**
   * User preferences
   *
   * @type {UserPreferences}
   * @memberof AddEditResultModalComponent
   */
  userPreferences: UserPreferences;
  /**
   * Stored information with weapons, skins, rarities, collections, etc...
   *
   * @private
   * @type {RootObject}
   * @memberof AddEditResultModalComponent
   */
  private storedRootObjWithItems: RootObject;
  /**
   * Subscription that watches for form value changes
   *
   * @private
   * @memberof AddEditResultModalComponent
   */
  private valueChangeSubscription = Subscription.EMPTY;
  /**
   * Subscription that watches for items (getting skins)
   *
   * @private
   * @type {Subscription}
   * @memberof AddEditResultModalComponent
   */
  private getItemSubscription: Subscription = Subscription.EMPTY;
  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private tradeupSearchService: TradeupSearchService,
    private sharedTradeupService: SharedTradeupService,
    private userPreferencesService: UserPreferencesLoaderService
  ) {
    // Storing user preferences for quick access
    this.userPreferences = this.userPreferencesService.getPreferences();
    // Initializing form
    this.createForm();
    // For easier access
    this.inputItems = this.tradeupForm.get('inputItems') as FormArray;
  }

  ngOnInit() {
    this.getItemSubscription = this.tradeupSearchService.getItems().subscribe((items) => {
      // Storing received items for collection search and other useful things
      this.storedRootObjWithItems = items;
      // Getting list of all skins
      this.allSkins = getAllSkins(items);
      const structCollection = structurizeItemByCollection(this.storedRootObjWithItems);
    });

    this.valueChangeSubscription = this.tradeupForm.valueChanges.subscribe(() => {
      this.summary = new TradeupResultSummary(this.tradeupForm.value, this.summary.cost);
    });

    // If we have passed result for editing then initializing it
    // NOTE: This should be after value change subscription in order to trigger
    // change detection logic (summary) after form values will be initialized. Otherwise
    // we initialize form values and only then subscribing to value changes
    if (this.resultForEdit) {
      this.initResult();
    }
  }

  ngOnDestroy() {
    this.valueChangeSubscription.unsubscribe();
    this.getItemSubscription.unsubscribe();
  }

  /**
   * Method saves current tradeup and returns it to parent component that called this modal
   *
   * @memberof AddEditResultModalComponent
   */
  save() {
    const result = this.tradeupForm.value as TradeupResult;
    // Saving result summary
    result.summary = this.summary;
    // Calculating tradeup summary and storing it
    result.calculatedSummary = this.calculateTradeup(result);

    if (this.resultForEdit) {
      // Adding ID of tradeup result that is currently editing
      result.id = this.resultForEdit.id;
      // Saving updated values
      this.saveUpdate(result);
    } else {
      // Adding new result
      this.addNewResult(result);
    }
  }

  /**
   * Method selects outcome from typeahead
   *
   * @param {NgbTypeaheadSelectItemEvent} foundItem Found aka selected item
   * @memberof AddEditResultModalComponent
   */
  selectOutcome(foundItem: NgbTypeaheadSelectItemEvent) {
    const collectionKeys = Object.keys(this.storedRootObjWithItems.collectionsWithSkins);
    const collections = collectionKeys.map(k => {
      // Taking only "key" and "name" properties and returning them as an object
      // Src: https://stackoverflow.com/a/39333479
      return (({ key, name }) => ({ key, name }))(this.storedRootObjWithItems.collectionsWithSkins[k]);
    });

    const outcome = new TradeupResultOutcome(foundItem.item, collections);
    this.tradeupForm.patchValue({ outcome });
  }

  /**
   * Method clears selected outcome
   *
   * @memberof AddEditResultModalComponent
   */
  clearOutcome() {
    this.tradeupForm.patchValue({ outcome: null, outcomeDisplayName: { name: '' } });
  }

  /**
   * Method that searches for skin by search term
   *
   * @memberof AddEditResultModalComponent
   */
  searchSkin = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2
          ? []
          : this.allSkins.filter((skin) => skin.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)
      )
    );

  /**
   * Method formats results to display skin name
   *
   * @memberof AddEditResultModalComponent
   */
  formatter = (x: Weapon) => x.name;

  /**
   * Method copies and stores price value
   *
   * @param {number} price Price that was copied
   * @memberof AddEditResultModalComponent
   */
  copyPrice(price: number) {
    this.copiedPrice = price;
  }

  /**
   * Method pastes copied price into provided form control
   *
   * @param {FormControl} control Form control which represents input where copied price should be pasted
   * @memberof AddEditResultModalComponent
   */
  pastePrice(control: FormControl) {
    // Setting copied price only if there is a value
    if (this.copiedPrice) {
      control.setValue(this.copiedPrice);
    }
  }

  /**
   * Method copies and stores copied skin name
   *
   * @param {string} name Skin name that was copied
   * @memberof AddEditResultModalComponent
   */
  copySkinName(name: string) {
    this.copiedSkinName = name;
  }

  /**
   * Method pastes copied skin name into provided form control
   *
   * @param {FormControl} control Form control which represents input where copied skin name should be pasted
   * @memberof AddEditResultModalComponent
   */
  pasteSkinName(control: FormControl) {
    // Setting copied skin name only if there is a value
    if (this.copiedSkinName) {
      control.setValue(this.copiedSkinName);
    }
  }

  /**
   * Method calculates tradeup summary
   *
   * @private
   * @param {TradeupResult} tradeupResult Tradeup result
   * @returns {TradeupSummary} Returns tradeup summary if there wasn't no errors. If any error occurred `undefined` will be returned
   * @memberof AddEditResultModalComponent
   */
  private calculateTradeup(tradeupResult: TradeupResult): TradeupSummary {
    try {
      const inputItems: TradeupItemWithFloat[] = [];

      // Since some names can contain (Factory new) / (field tested) and other unwanted info in
      // skin name then we remove them in order to be able to find correect skin.
      const inputNames = tradeupResult.inputItems.map((input) => input.name.replace(/ \([^()]*\)/g, ''));
      // Walking through 10 input items and adding found skin information to input item list
      for (let i = 0; i < 10; i++) {
        // NOTE: Converting to lower case only for purpose of searching
        const foundSkin = this.allSkins.find((skin) => skin.name.toLowerCase() === inputNames[i].toLowerCase());
        if (foundSkin) {
          inputItems.push({ item: foundSkin, float: tradeupResult.inputItems[i].float });
        }
      }
      const structCollection = structurizeItemByCollection(this.storedRootObjWithItems);
      // Calculating tradeup summary
      const calculatedSummary = calculateTradeUp(inputItems, this.tradeupForm.get('stattrak').value, structCollection);
      return calculatedSummary;
    } catch (error) {
      // If somethning goes wrong then returning "undefined" to show that there is no summary
      return undefined;
    }
  }

  /**
   * Method adds new result to IndexedDB
   *
   * @private
   * @param {TradeupResult} result Tradeup result that has to be added
   * @memberof AddEditResultModalComponent
   */
  private addNewResult(result: TradeupResult) {
    // Adding record
    this.sharedTradeupService.addNewResult(result).subscribe((id) => {
      // Adding ID to our tradeup inffo
      const dto = Object.assign({ id }, result);
      this.activeModal.close(dto);
    });
  }

  /**
   * Method initializes result for editing
   *
   * @private
   * @memberof AddEditResultModalComponent
   */
  private initResult() {
    // Storing values that should be applied to form. We need them to add outcome display name later
    const valuesForForm = Object.assign({}, this.resultForEdit);
    // If result has outcome set then adding outcome name for display
    if (this.resultForEdit.outcome) {
      valuesForForm['outcomeDisplayName'] = { name: this.resultForEdit.outcome.name };
    }
    // Updating form values
    this.tradeupForm.patchValue(valuesForForm);
  }

  /**
   * Method saves updated result to IndexedDB
   *
   * @private
   * @param {TradeupResult} updatedResult Updated result value
   * @memberof AddEditResultModalComponent
   */
  private saveUpdate(updatedResult: TradeupResult) {
    // from(this.ngxIndexedDb.update('result', updatedResult))
    this.sharedTradeupService.updateResult(updatedResult).subscribe(() => {
      this.activeModal.close(updatedResult);
    });
  }

  /**
   * Method creates form group for tradeup input item
   *
   * @private
   * @returns Returns `FormGroup` with tradeup input form controls
   * @memberof AddEditResultModalComponent
   */
  private createInputGroup() {
    return new FormGroup({
      name: new FormControl(''),
      float: new FormControl(0, [Validators.min(0), Validators.max(1)]),
      price: new FormControl(0, Validators.min(0)),
    });
  }

  /**
   * Method creates tradeup form
   *
   * @private
   * @memberof AddEditResultModalComponent
   */
  private createForm() {
    this.tradeupForm = this.formBuilder.group({
      tradeupName: [''],
      inputItems: new FormArray(
        // Creating 10 empty tradeup input slots
        [...new Array(10).fill(null)].map(() => this.createInputGroup())
      ),
      outcome: [null],
      // NOTE: Since we are using result formatting then initially our outcome item must be also as object with name property
      outcomeDisplayName: [{ name: '' }],
      outcomeFloat: [null, [Validators.min(0), Validators.max(1)]],
      received: [0, Validators.min(0)],
      notes: [''],
      stattrak: [false],
      floatRequired: [0, [Validators.min(0), Validators.max(1)]],
      // NOTE: Only for saving purposes
      created: [null],
      completed: [null],
      modified: [null],
    });
  }
}

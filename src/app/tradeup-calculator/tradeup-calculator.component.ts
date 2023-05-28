import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { RootObject, Weapon } from '@server/items';
import * as _ from 'lodash';
import { combineLatest, Subscription } from 'rxjs';
import { debounceTime, skip, startWith, switchMap } from 'rxjs/operators';
import { AuthService } from '../@core/auth.service';
import { FALLBACK_NAME_IDS } from '../@core/fallback-name-ids';
import { decodeWeaponName, decompressQuery } from '../@core/utils';
import { TradeupSearchService } from '../tradeup-search/tradeup-search.service';
import { calculateTradeUp, structurizeItemByCollection } from '../tradeup-search/tradeup-search.utils';
import { getAllSkins, getFloatIndexForPrice, getPrice } from '../tradeup-search/tradeup-shared-utils';
import {
  ITradeupSettings,
  StructuredCollectionWithItems,
  TradeupItemWithFloat,
  TradeupOutcome,
  TradeupSummary,
  WeaponRarity
} from '../tradeup-search/tradeup.model';
import { CalculatorAddMultipleInventoryModalComponent } from './calculator-add-multiple-inventory-modal/calculator-add-multiple-inventory-modal.component';
import {
  CalculatorFormInputItem,
  CalculatorInputItem,
  CalculatorShareInfo,
  TradeupFromSearchForCalculation
} from './tradeup-calculator.model';

@Component({
  selector: 'app-tradeup-calculator',
  templateUrl: './tradeup-calculator.component.html',
  styleUrls: ['./tradeup-calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupCalculatorComponent implements OnInit, OnDestroy {
  /**
   * Flag indicates if something is being loaded
   *
   * @type {boolean}
   * @memberof TradeupCalculatorComponent
   */
  isLoading: boolean;
  /**
   * Form for tradeup calculation
   *
   * @type {FormGroup}
   * @memberof TradeupCalculatorComponent
   */
  calculatorForm: FormGroup;
  /**
   * Form array with tradeup input items. Used for quick access. Type `CalculatorInputItem[]`
   *
   * @type {FormArray}
   * @memberof TradeupCalculatorComponent
   */
  inputItems: FormArray;
  /**
   * List with all skins for typeahead aka autocomplete
   *
   * @type {Weapon[]}
   * @memberof TradeupCalculatorComponent
   */
  currentRaritySkins: Weapon[];
  /**
   * Id of current tab. Tab id is rarity value.
   * By default is 3 "Mil-specs" or overwritten by default tradeup settings
   *
   * @type {number}
   * @memberof TradeupCalculatorComponent
   */
  currentTabId: number = 3;
  /**
   * List of available rarities (numeric value of enum)
   *
   * @type {number[]}
   * @memberof TradeupCalculatorComponent
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
   * @memberof TradeupCalculatorComponent
   */
  rarityEnum = WeaponRarity;
  /**
   * Current rarity value on form
   *
   * @readonly
   * @memberof TradeupCalculatorComponent
   */
  get rarityOnForm() {
    return this.calculatorForm.get('rarity').value;
  }
  /**
   * Trade up settings.
   * By default initializes with default settings
   *
   * @type {ITradeupSettings}
   * @memberof TradeupCalculatorComponent
   */
  tradeupSettings: ITradeupSettings = { rarity: 3, stattrak: false, withoutSteamTax: false };
  /**
   * Calculated trade up summary
   *
   * @type {TradeupSummary}
   * @memberof TradeupCalculatorComponent
   */
  tradeupSummary: TradeupSummary;
  /**
   * Amount of empty slots in calculator. Empty slots are considered items without selected weapon (skin).
   * Initially it is 10
   *
   * @type {number}
   * @memberof TradeupCalculatorComponent
   */
  emptySlotAmount: number = 10;
  /**
   * Flag indicates if input items are collapsed
   *
   * @type {boolean}
   * @memberof TradeupCalculatorComponent
   */
  inputsCollapsed: boolean = false;
  /**
   * Current input item average float
   *
   * @type {number}
   * @memberof TradeupCalculatorComponent
   */
  averageFloat: number;
  /**
   * Structurized collections
   *
   * @type {StructuredCollectionWithItems[]}
   * @memberof TradeupCalculatorComponent
   */
  structCollection: StructuredCollectionWithItems[];
  /**
   * Flag indicates if overview is visible
   *
   * @type {boolean}
   * @memberof TradeupCalculatorComponent
   */
  overviewIsVisible: boolean = false;
  /**
   * Indicates if current user is authenticated
   *
   * @type {boolean}
   * @memberof TradeupCalculatorComponent
   */
  userAuthenticated: boolean = false;
  /**
   * Stored information with weapons, skins, rarities, collections, etc...
   *
   * @private
   * @type {RootObject}
   * @memberof TradeupCalculatorComponent
   */
  private storedRootObjWithItems: RootObject;
  /**
   * Flag indicates if this is shared tradeup and manual calculation should be performed
   *
   * @private
   * @type {boolean}
   * @memberof TradeupCalculatorComponent
   */
  private sharedTradeup: boolean;
  /**
   * Subscription that watches for items (getting skins)
   *
   * @private
   * @type {Subscription}
   * @memberof TradeupCalculatorComponent
   */
  private getItemSubscription: Subscription = Subscription.EMPTY;
  /**
   * Subscription that watches for calculator form value changes (only specific values)
   *
   * @private
   * @type {Subscription}
   * @memberof TradeupCalculatorComponent
   */
  private formValueChangeSubscription: Subscription = Subscription.EMPTY;
  /**
   * Subscription watches for calculator input item value changes. If any item in
   * calculator changes then we need to re-calculate everything
   *
   * @private
   * @type {Subscription}
   * @memberof TradeupCalculatorComponent
   */
  private calculatorItemValueChangeSubscription: Subscription = Subscription.EMPTY;
  /**
   * Information about shared trade up that has to be recreated
   *
   * @private
   * @type {CalculatorShareInfo}
   * @memberof TradeupCalculatorComponent
   */
  private sharedTradeupInfo: CalculatorShareInfo;
  constructor(
    private formBuilder: FormBuilder,
    private tradeupSearchService: TradeupSearchService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private authService: AuthService
  ) {
    // Checking if user is authenticated
    this.userAuthenticated = this.authService.isAuthenticated();
    // Initialiizing current tab ID with default tradeup settings
    this.currentTabId = this.tradeupSettings.rarity;
    // Creating new form and storing it
    this.calculatorForm = this.createForm(this.currentTabId);

    // Storing form array for quick access
    this.inputItems = this.calculatorForm.get('items') as FormArray;

    // Checking if we have shared tradeup from search
    const tradeup = this.router.getCurrentNavigation()?.extras?.state as TradeupFromSearchForCalculation;
    // If we do have then initializing it
    if (tradeup) {
      this.initTradeup(tradeup);
    }
  }

  ngOnInit() {
    // Subscribing to query params because they might contain information about
    // shared trade up and after query params requesting information about skins
    this.getItemSubscription = this.route.queryParams
      .pipe(
        switchMap((params) => {
          // Updating calculator form settings and decompressing + storing information about trade up
          // that we have to recreate ONLY IF WE HAVE INPUTS QUERY PARAM
          if (params.inputs) {
            // Updating calculator form with params that we received from query string (config params)
            this.calculatorForm.patchValue({
              stattrak: Boolean(params.st),
              rarity: +params.r,
              withoutSteamTax: Boolean(params.notax),
            });

            // Decompressing query and getting tradeup information for recreation and storing this information
            this.sharedTradeupInfo = decompressQuery(params.inputs);
          }
          // Getting items
          return this.tradeupSearchService.getItems();
        })
      )
      .subscribe((items) => {
        // Storing tradeup settings
        this.tradeupSettings = this.getTradeupSettings();

        // Storing received items for collection search and other useful things
        this.storedRootObjWithItems = items;
        // Structurizing items by collections in order to generate summary for tradeup
        this.structCollection = structurizeItemByCollection(items);
        // Getting and storing skins for current rarity
        this.storeSkinsForCurrentRarity();

        // If we have information about shared tradeup then we have to recreate it
        if (this.sharedTradeupInfo) {
          this.recreateTradeup();
        }

        // Marking view for re-render because we have some changes
        this.cdr.markForCheck();
      });

    // Subscribing to stattrak and rarity value changes. If these values change then
    // we need to reset calculator form
    this.formValueChangeSubscription = combineLatest([
      this.calculatorForm.get('stattrak').valueChanges.pipe(
        // We need to provide starting values because otherwise combineLatest
        // will have to wait until user manually changes both inputs
        startWith(this.tradeupSettings.stattrak)
      ),
      this.calculatorForm.get('rarity').valueChanges.pipe(
        // We need to provide starting values because otherwise combineLatest
        // will have to wait until user manually changes both inputs
        startWith(this.tradeupSettings.rarity)
      ),
    ])
      .pipe(
        // Skipping first because we have startWith that fire initially.
        // It will be better if we ignore initial call and act only on real changes
        skip(1)
      )
      .subscribe((result) => {
        // Getting and storing skins for current rarity
        this.storeSkinsForCurrentRarity();

        // Storing new values
        const [stattrak, rarity] = result;

        // If user switched from Normal to Stattrak or Vice-Versa
        // then checking if input item meets these criterias
        if (this.tradeupSettings.stattrak !== stattrak) {
          // Getting input items for quick access
          const inputItems = this.inputItems.value as CalculatorInputItem[];
          // Walking through every input item and clearing it if it can't be Stattrak
          inputItems.forEach((item, index) => {
            // If item can't be stattrak then resetting item (will be empty slot)
            if (stattrak && !item.inputItem?.stattrak) {
              this.inputItems.at(index).reset();
            }
          });
        }

        // If rarity has changed we need to reset calculator
        if (this.tradeupSettings.rarity !== rarity) {
          this.resetCalculator();
        }
      });

    // Subscribing to input changes which affect calculation
    this.calculatorItemValueChangeSubscription = combineLatest([
      this.calculatorForm.get('items').valueChanges.pipe(
        // We need to provide starting values because otherwise combineLatest
        // will have to wait until user manually changes both inputs
        startWith([])
      ),
      this.calculatorForm.get('withoutSteamTax').valueChanges.pipe(
        // We need to provide starting values because otherwise combineLatest
        // will have to wait until user manually changes both inputs
        startWith(false)
      ),
    ])
      .pipe(
        // Skipping first because we have startWith that fire initially.
        // It will be better if we ignore initial call and act only on real changes.
        // NOTE: We are skipping first only if we don't have shared tradeup. Otherwise it is mandatory
        // that calculation will be perfomed because this shared tradeup was initialized before
        skip(this.sharedTradeup ? 0 : 1),
        // Adding debounce of 200ms to avoid IMMEDIATE change to calculation
        debounceTime(200)
      )
      .subscribe((result) => {
        // Storing tradeup settings
        this.tradeupSettings = this.getTradeupSettings();

        // Finding amount of input items without selected skin and setting this value as "Empty slots"
        this.emptySlotAmount = this.inputItems.controls.filter((ctrl) => !Boolean(ctrl.value.inputItem)).length;

        // Checking if input items are valid
        if (this.inputItems.valid) {
          // Performing calculation since input items changed
          this.calculate();
        } else {
          // If all slots are empty then clearing average float
          if (this.emptySlotAmount === 10) {
            this.averageFloat = undefined;
          }

          // If there is at least one empty slot then clearing trade up summary. Otherwise it
          // remains in case when user adds 10 items -> summary is shown -> removes input but summary remainss
          if (this.emptySlotAmount) {
            this.tradeupSummary = undefined;
          }
        }
        // Calculating current average float of input items
        this.calculateAverageFloat();
        // Marking view for re-render because we have some changes
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.getItemSubscription.unsubscribe();
    this.formValueChangeSubscription.unsubscribe();
    this.calculatorItemValueChangeSubscription.unsubscribe();
  }

  /**
   * Method changes tab and stores current tab ID
   *
   * @param {NgbNavChangeEvent} tabChangeEvent Ng-bootstrap tab change event
   * @memberof TradeupCalculatorComponent
   */
  changeTab(tabId: NgbNavChangeEvent) {
    this.currentTabId = tabId.nextId;
    // Updating rarity value on form because otherwise via click in view
    // it doesn't get triggered because there is an anchor that is used for tab
    // changing
    this.calculatorForm.get('rarity').setValue(this.currentTabId);
  }

  /**
   * Method toggles collapse state of input items
   *
   * @memberof TradeupCalculatorComponent
   */
  toggleCollapse() {
    this.inputsCollapsed = !this.inputsCollapsed;
  }

  /**
   * Method calculates average float for current input items and stores calculated value for display
   *
   * @memberof TradeupCalculatorComponent
   */
  calculateAverageFloat() {
    // Calculating sum of all input items
    const floatSum = this.inputItems.controls.reduce((a: AbstractControl, b: AbstractControl) => a + b.value.float, 0);
    // Calculating only if floatSum is more than 0 otherwise we will be trying to divide "0" and we don't need it
    if (floatSum > 0) {
      // Calculating amount of filled input slots. If all are filled then
      // assigning value "10" to avoid divide by 0 and also since all
      // slots are filled then we need to get float by all 10 items
      const nonEmptySlotAmount = 10 - this.emptySlotAmount || 10;
      // Calculating average float and storing it as number with 7 digits after comma
      this.averageFloat = +(floatSum / nonEmptySlotAmount).toFixed(7);
      // Marking that there are changes that need re-render for display
      this.cdr.markForCheck();
    }
  }

  /**
   * Method resets calculator (Input items)
   *
   * @memberof TradeupCalculatorComponent
   */
  resetCalculator() {
    // Creating new initial form
    const newForm = this.createForm(this.currentTabId);
    // Storing initial input items for quick access
    const initialInputItems = newForm.get('items').value;
    // Resetting input items with initial values
    this.calculatorForm.get('items').reset(initialInputItems);
    this.calculatorForm.get('items').clearValidators();
    // Clearing tradeup summary
    this.tradeupSummary = undefined;
    // Clearing average float
    this.averageFloat = undefined;
    // Marking view for re-render because we have some changes
    this.cdr.markForCheck();
  }

  /**
   * Method recalculates tradeup summary
   *
   * @param {TradeupOutcome} outcome Updated outcome which contains updated price
   * @memberof TradeupCalculatorComponent
   */
  recalculateSummary(outcome: TradeupOutcome) {
    // Storing input items from form for quick access
    const inputItems = this.inputItems.value as CalculatorInputItem[];

    // Getting items for calculation
    const itemsForCalculation = this.getItemsForCalculation(inputItems);

    // Calculating summary again, but this time we are passing updated outcome with custom price
    const summary = calculateTradeUp(
      itemsForCalculation,
      this.tradeupSettings.stattrak,
      this.structCollection,
      this.tradeupSettings.withoutSteamTax,
      true,
      outcome
    );

    // Storing new summary for display
    this.tradeupSummary = summary;

    // Marking view for re-render because we have some changes
    this.cdr.markForCheck();
  }

  /**
   * Method opens modal to select multiple inventory itemss for calculator
   *
   * @memberof TradeupCalculatorComponent
   */
  openMultipleItemSelectModal() {
    // Opening modal
    const modalRef = this.modalService.open(CalculatorAddMultipleInventoryModalComponent, {
      size: 'xl',
      scrollable: true,
    });
    // Setting necessary data that should be available in modal component
    modalRef.componentInstance.structCollection = this.structCollection;
    modalRef.componentInstance.itemsForSelect = this.currentRaritySkins;
    modalRef.componentInstance.rarity = this.calculatorForm.get('rarity').value;
    modalRef.componentInstance.stattrak = this.calculatorForm.get('stattrak').value;
    modalRef.componentInstance.itemsInCalculator = this.calculatorForm.get('items').value;

    // Waiting for response
    modalRef.result.then(
      (items: CalculatorFormInputItem[]) => {
        // Getting list of free slots in calculator
        const freeSlotsInCalculator = this.inputItems.controls.filter((ctrl) => !ctrl.value.inputItem);
        // Filling them up
        items.forEach((item, index) => freeSlotsInCalculator[index].setValue(item));
        // NOTE: this should remain empty even if not used to avoid errors`
      },
      () => { }
    );
  }

  /**
   * Method creates trade up settings by getting specific values from form
   *
   * @private
   * @returns {ITradeupSettings} Returns trade up settings based on calculator form values
   * @memberof TradeupCalculatorComponent
   */
  private getTradeupSettings(): ITradeupSettings {
    // Creating tradeup setting model based on form values
    const tradeupSettings: ITradeupSettings = {
      rarity: this.calculatorForm.get('rarity').value,
      stattrak: this.calculatorForm.get('stattrak').value,
      withoutSteamTax: this.calculatorForm.get('withoutSteamTax').value,
    };

    // Returning tradeup settings
    return tradeupSettings;
  }

  /**
   * Method converts calculator items for summary calculation and returns theem
   *
   * @private
   * @param {CalculatorInputItem[]} inputItems Input items in calculator
   * @returns {TradeupItemWithFloat[]} Returns list with trade up items with float
   * that are used for summary calculation
   * @memberof TradeupCalculatorComponent
   */
  private getItemsForCalculation(inputItems: CalculatorInputItem[]): TradeupItemWithFloat[] {
    // Walking through every input item and mapping appropriate model
    return inputItems.map((item) => {
      // We need to clone current item into new variable because on price change all items
      // get affected due references. With deep clone we are not keeping references. Also
      // important notice is that we have to use deep clone because we have nested objects
      // FIXME: Get rid of lodash and use "structuredClone"
      const uniqueItem = _.cloneDeep(item);
      // Setting custom price
      // TODO: Implement price change based on provider
      if (this.tradeupSettings.stattrak) {
        uniqueItem.inputItem.price.stattrak[uniqueItem.floatIndex] = uniqueItem.price;
      } else {
        uniqueItem.inputItem.price.normal[uniqueItem.floatIndex] = uniqueItem.price;
      }
      // alert(`NEED TO IMPLEMENT IT`);
      // Creating initiial item for calculation
      const tradeupItemWithFloat = new TradeupItemWithFloat();
      // Filling input item with necessary information
      tradeupItemWithFloat.float = uniqueItem.float;
      tradeupItemWithFloat.item = uniqueItem.inputItem;
      // Returning updated tradeup item for calculcation
      return tradeupItemWithFloat;
    });
  }

  /**
   * Method performs trade up calculation
   *
   * @private
   * @memberof TradeupCalculatorComponent
   */
  private calculate() {
    // Storing tradeup settings
    this.tradeupSettings = this.getTradeupSettings();

    // Storing input items from form for quick access
    const inputItems = this.inputItems.value as CalculatorInputItem[];

    // Getting items for calculation
    const itemsForCalculation = this.getItemsForCalculation(inputItems);

    // Calculating summary
    const summary = calculateTradeUp(
      itemsForCalculation,
      this.tradeupSettings.stattrak,
      this.structCollection,
      this.tradeupSettings.withoutSteamTax,
      true
    );
    // If we have outcome summary then storing it
    if (summary.outcomeSummary) {
      // Calculating and storing calculated summary
      this.tradeupSummary = summary;
    } else {
      // Finding amount of input items without selected skin and setting this value as "Empty slots"
      this.emptySlotAmount = this.inputItems.controls.filter((ctrl) => !Boolean(ctrl.value.inputItem)).length;
    }

    // Marking view for re-render because we have some changes
    this.cdr.markForCheck();
  }

  /**
   * Method creates tradeup input form group with necessary controls
   *
   * @private
   * @returns {FormGroup} Returns `FormGroup` with controls that are used for tradeup input item
   * @memberof TradeupCalculatorComponent
   */
  private createItem(): FormGroup {
    return this.formBuilder.group({
      inputItem: [null, Validators.required],
      float: [null],
      price: [0, [Validators.required, Validators.min(0)]],
      floatIndex: [null],
      inventoryItemId: [null],
    });
  }

  /**
   * Method creates initial form for calculator
   *
   * @private
   * @memberof TradeupCalculatorComponent
   */
  private createForm(defaultRarity: number) {
    return this.formBuilder.group({
      stattrak: [this.tradeupSettings.stattrak, Validators.required],
      rarity: [defaultRarity, Validators.required],
      withoutSteamTax: [this.tradeupSettings.withoutSteamTax],
      items: this.formBuilder.array(
        // Creating empty array containing of 10 elements
        new Array(10)
          // Filling them with null values because they will get overwritten
          .fill(null)
          // Changing each created item with empty tradeup input itemk
          .map(() => this.createItem())
      ),
    });
  }

  /**
   * Method gets skins for current rarity and stores them. Also it is dependant
   * on stattrak or not
   *
   * @private
   * @memberof TradeupCalculatorComponent
   */
  private storeSkinsForCurrentRarity() {
    // Getting list of all skins for current rarity and depending on if its Stattrak or Normal weapon.
    // Also taking only those skins that have outcomes
    this.currentRaritySkins = getAllSkins(
      this.storedRootObjWithItems,
      this.calculatorForm.get('stattrak').value,
      this.rarityOnForm,
      this.structCollection
    );
  }

  /**
   * Method initializes trade up
   *
   * @private
   * @param {TradeupFromSearchForCalculation} tradeup Tradeup information for initialization
   * @memberof TradeupCalculatorComponent
   */
  private initTradeup(tradeup: TradeupFromSearchForCalculation) {
    // Initializing settings
    this.calculatorForm.patchValue({
      stattrak: tradeup.settings.stattrak,
      withoutSteamTax: tradeup.settings.compareWithoutTax,
      rarity: tradeup.settings.rarity,
    });

    // Adding item to every control (input item slot)
    this.inputItems.controls.forEach((ctrl, i) => {
      // Storing information about skin from search for quick access
      const itemFromSearch = tradeup.tradeup.items[i];

      const inputItemForCalculation = new CalculatorInputItem();
      // Setting item float
      inputItemForCalculation.float = +itemFromSearch.float.toFixed(7);
      // Setting float index based on current float
      inputItemForCalculation.floatIndex = getFloatIndexForPrice(inputItemForCalculation.float);
      // Setting information about current item (skin)
      inputItemForCalculation.inputItem = itemFromSearch.item;
      // Setting price for tradeup item
      inputItemForCalculation.price = +getPrice(
        itemFromSearch.item,
        inputItemForCalculation.float,
        tradeup.settings.stattrak,
        false
      ).toFixed(2);

      // Updating value of input item on form
      ctrl.patchValue(inputItemForCalculation);
      // Setting validation on float
      this.setValidationOnControl(ctrl, inputItemForCalculation);
    });

    // Marking flag that this is shared tradeup and we need to perform calculation manually
    // as soon as we can
    this.sharedTradeup = true;
  }

  /**
   * Method sets validation for float on specific control based on skins float cap
   *
   * @private
   * @param {AbstractControl} ctrl Input item form control
   * @param {CalculatorInputItem} inputItemForCalculation Skin that will be used as input item. Float cap will be taken from it
   * @memberof TradeupCalculatorComponent
   */
  private setValidationOnControl(ctrl: AbstractControl, inputItemForCalculation: CalculatorInputItem) {
    // Adding validators for float input based on skin params
    ctrl.get('float').setValidators([
      // Setting that float is required because with "setValidators" we are assigning
      // new validators instead of appending
      Validators.required,
      // Setting min value depending on min float
      Validators.min(inputItemForCalculation.inputItem.min),
      // Setting max value depending on max float
      Validators.max(inputItemForCalculation.inputItem.max),
    ]);
  }
  /**
   * Method recreates trade up based on information about shared trade up. It gets information about
   * skins in input items, sets prices, floats and validation on controls
   *
   * @private
   * @memberof TradeupCalculatorComponent
   */
  private recreateTradeup() {
    // Filling tradeup with empty values because afterwards we will replace them with new ones.
    // Doing that to avoid errors
    const skinsForInput: TradeupItemWithFloat[] = new Array(10).fill(new TradeupItemWithFloat());

    // Going through each item ID provided via sharing and filling our
    // tradeup information with actual items based on their name (item) IDs
    this.sharedTradeupInfo.itemIds.forEach((itemId, i) => {
      // Getting weapon name by name ID
      const weaponName = decodeWeaponName(itemId) || FALLBACK_NAME_IDS[itemId];
      // Getting weapon by weapon name
      const weapon = this.storedRootObjWithItems.weapons[weaponName];
      // Setting input item with found weapon and setting float accordingly
      skinsForInput[i] = new TradeupItemWithFloat({ item: weapon, float: this.sharedTradeupInfo.floats[i] });
    });

    // Adding item to every control (input item slot)
    this.inputItems.controls.forEach((ctrl, i) => {
      // Storing information about skin that should be used
      const itemForInput = skinsForInput[i];

      // Setting item on calculator input only if we have previously selected item information
      if (itemForInput.item) {
        const inputItemForCalculation = new CalculatorInputItem();
        // Setting item float
        inputItemForCalculation.float = this.sharedTradeupInfo.floats[i];
        // Setting float index based on current float
        inputItemForCalculation.floatIndex = getFloatIndexForPrice(inputItemForCalculation.float);
        // Setting information about current item (skin)
        inputItemForCalculation.inputItem = itemForInput.item;
        // Setting price for tradeup item
        inputItemForCalculation.price = this.sharedTradeupInfo.prices[i];

        // Updating value of input item on form
        ctrl.patchValue(inputItemForCalculation);
        // Setting validation on float
        this.setValidationOnControl(ctrl, inputItemForCalculation);
      }
    });

    // Marking flag that this is shared tradeup and we need to perform calculation manually
    // as soon as we can
    this.sharedTradeup = true;
  }

  /**
   * Asking user to confirm his "Refresh/Page reload" action. Browser default prompt will be shown
   *
   * @private
   * @param {Event} event Beforeunload event
   * @memberof TradeupCalculatorComponent
   */
  @HostListener('window:beforeunload', ['$event'])
  private unloadHandler(event: Event) {
    // Showing alert only if there are input items in calculator
    if (this.emptySlotAmount !== 10) {
      event.returnValue = false;
    }
  }
}

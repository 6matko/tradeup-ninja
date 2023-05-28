import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ControlContainer, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Collection } from '@server/items';
import { compress } from 'lzutf8';
import { ToastrService } from 'ngx-toastr';
import { copyToClipboard } from '../../@core/utils';
import { SharedTradeupService } from '../../@shared/shared-tradeup/shared-tradeup.service';
import { TradeupInputItem, TradeupResult, TradeupResultSummary } from '../../tradeup-result/tradeup-result.model';
import { calculateTradeUp } from '../../tradeup-search/tradeup-search.utils';
import { getFloatIndexForPrice, getPrice } from '../../tradeup-search/tradeup-shared-utils';
// tslint:disable-next-line:max-line-length
import {
  BestTradeup,
  ITradeupSettings,
  StructuredCollectionWithItems,
  TradeupItemWithFloat,
  TradeupSearchProgress,
  TradeupSearchSettings,
  TradeupSummary,
  WorkerResponse,
} from '../../tradeup-search/tradeup.model';
import { SimulationData } from '../../tradeup-simulation/tradeup-simulation.model';
import { TradeupSimulationService } from '../../tradeup-simulation/tradeup-simulation.service';
import { CalculatorInputItem, CalculatorShareInfo } from '../tradeup-calculator.model';

@Component({
  selector: 'app-tradeup-calculator-actions',
  templateUrl: './tradeup-calculator-actions.component.html',
  styleUrls: ['./tradeup-calculator-actions.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class TradeupCalculatorActionsComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * Input items thare are on form
   *
   * @type {CalculatorInputItem[]}
   * @memberof TradeupCalculatorActionsComponent
   */
  @Input() inputItems: CalculatorInputItem[] = [];
  /**
   * Trade up summary
   *
   * @type {TradeupSummary}
   * @memberof TradeupCalculatorActionsComponent
   */
  @Input() summary: TradeupSummary;
  /**
   * Current trade up settings
   *
   * @type {ITradeupSettings}
   * @memberof TradeupCalculatorActionsComponent
   */
  @Input() settings: ITradeupSettings;
  /**
   * Structurized collections with items in them
   *
   * @type {StructuredCollectionWithItems[]}
   * @memberof TradeupCalculatorActionsComponent
   */
  @Input() structCollections: StructuredCollectionWithItems[];
  /**
   * Amount of empty slots on trade up
   *
   * @type {number}
   * @memberof TradeupCalculatorActionsComponent
   */
  @Input() emtpySlotAmount: number;
  /**
   * Event emitter that indicates if loading is active
   *
   * @type {EventEmitter<boolean>}
   * @memberof TradeupCalculatorActionsComponent
   */
  @Output() loadingActive: EventEmitter<boolean> = new EventEmitter();
  /**
   * Event emitter that indicates that tradeup should be re-set aka cleared
   *
   * @type {EventEmitter<void>}
   * @memberof TradeupCalculatorActionsComponent
   */
  @Output() resetTradeup: EventEmitter<void> = new EventEmitter();
  /**
   * Event emitter that indicates that overview view should be opened
   *
   * @type {EventEmitter<void>}
   * @memberof TradeupCalculatorActionsComponent
   */
  @Output() openOverview: EventEmitter<void> = new EventEmitter();
  /**
   * Flag indicates if search or other process is processing (active)
   *
   * @type {boolean}
   * @memberof TradeupCalculatorActionsComponent
   */
  isLoading: boolean;
  /**
   * Progress of tradeup search. Used for visual indication
   *
   * @type {TradeupSearchProgress}
   * @memberof TradeupCalculatorActionsComponent
   */
  searchProgress: TradeupSearchProgress;
  /**
   * Form for search settings
   *
   * @type {FormGroup}
   * @memberof TradeupCalculatorActionsComponent
   */
  searchSettingForm: FormGroup;
  /**
   * Url for sharing
   *
   * @type {string}
   * @memberof TradeupCalculatorActionsComponent
   */
  shareUrl: string;
  /**
   * Text that is displayed in "Copy link" button
   *
   * @type {string}
   * @memberof TradeupCalculatorActionsComponent
   */
  copyLinkDisplayText: string = 'Copy link';
  /**
   * List with collections that will be used for search in primary/include/exclude lists
   *
   * @type {Collection[]}
   * @memberof TradeupCalculatorActionsComponent
   */
  collectionsForSearch: Collection[] = [];
  /**
   * Worker instance
   *
   * @private
   * @type {Worker}
   * @memberof TradeupCalculatorActionsComponent
   */
  private worker: Worker;
  /**
   * Best tradeups that were found. Used to store default ordering
   *
   * @private
   * @type {BestTradeup[]}
   * @memberof TradeupCalculatorActionsComponent
   */
  private bestTradeups: BestTradeup[] = [];
  constructor(
    private sharedTradeupService: SharedTradeupService,
    private tradeupSimulationService: TradeupSimulationService,
    private cdr: ChangeDetectorRef,
    private parentForm: FormGroupDirective,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.createSearchForm();
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // If we received struct collections then initializing collections for search for current rarity.
    // NOTE: We are filtering collections for search aka display on calculator setting changes so
    // we always have correct collections for specific rarity
    if (changes.structCollections?.currentValue || (changes.settings?.currentValue && this.structCollections)) {
      // Getting collections for search based on current rarity.
      // Filtering collections by rarity
      this.collectionsForSearch = this.structCollections
        .filter((col) => col.items[this.settings.rarity]?.skins?.length)
        // If stattrak setting is enabled then filtering those collections that have "STATTRAK" weapons and therefore
        // ignoring collections with non-stattrak weapons
        .filter((col) => (this.settings.stattrak ? col.items[this.settings.rarity]?.skins[0]?.stattrak : true))
        // Taking only information about collection
        .map((col) => col.collection);

      // If collection list for search changed then clearing up previous selections
      // to prevent case of invalid collections remaining when settings have changed
      // NOTE: We are clearing previous selections ONLY if STATTRAK setting or RARITY setting have changed
      if (
        changes.settings?.currentValue?.stattrak !== changes.settings?.previousValue?.stattrak ||
        changes.settings?.currentValue?.rarity !== changes.settings?.previousValue?.rarity
      ) {
        this.searchSettingForm.patchValue({
          excludedCollections: [],
          includedCollections: [],
          primaryCollection: null,
        });
      }
    }
  }

  /**
   * Method emits event to clear aka reset tradeup (calculator)
   *
   * @memberof TradeupCalculatorActionsComponent
   */
  clearTradeup() {
    this.resetTradeup.emit();
  }

  /**
   * Method starts tradeup search process
   *
   * @memberof TradeupCalculatorActionsComponent
   */
  start() {
    if (this.worker) {
      this.stop();
    }

    // Clearing search
    this.bestTradeups.length = 0;

    // Enabling loading indicator
    this.isLoading = true;
    // Emitting loading active state
    this.loadingActive.emit(this.isLoading);

    // Initializing worker
    this.initWorker();

    // Setting search settings
    let settings = new TradeupSearchSettings();
    // We need only most profitable tradeup so 1 will be enough
    settings.maxTradeups = 1;
    // Adding other basic settings from parent settings
    settings.rarity = this.settings.rarity;
    settings.stattrak = this.settings.stattrak;
    settings.compareWithoutTax = this.settings.withoutSteamTax;

    // Storing values from form to current settings
    settings = Object.assign(settings, this.searchSettingForm.value);

    // Starting search process
    this.worker.postMessage({
      cmd: 'start',
      structCollections: this.structCollections,
      settings,
      inputItems: this.inputItems,
    });
  }

  /**
   * Method stops search process (Terminates worker)
   *
   * @memberof TradeupCalculatorActionsComponent
   */
  stop() {
    this.worker.terminate();
    // Disabling loading indicator
    this.isLoading = false;
    // Emitting loading active state
    this.loadingActive.emit(this.isLoading);
  }

  /**
   * Method opens simulation menu for selected tradeup
   *
   * @param {BestTradeup} tradeup Tradeup information for which simulation should be done
   * @memberof TradeupCalculatorActionsComponent
   */
  simulateTradeup() {
    // Creating object with basic information for simulation
    const simData = new SimulationData();
    simData.cost = this.summary.cost;
    simData.outcomes = this.summary.outcomeSummary.outcomes;
    simData.stattrak = this.settings.stattrak;
    // Simulating tradeup
    this.tradeupSimulationService.simulateTradeupByOutcomes(simData);
  }

  /**
   * Method creats and stores share link for current tradeup
   *
   * @memberof TradeupCalculatorActionsComponent
   */
  createShareLink() {
    // Storing input items on form for quick access
    const inputItemsOnForm = this.parentForm.form.get('items').value as CalculatorInputItem[];

    // Creating object that we will compress and pass as query param
    const tradeupShareInfo: CalculatorShareInfo = {
      // Filtering name IDs list only to those values that have nameId (truthy value)
      // and after filtering we take first because we need the name ID. They are identical in list.
      // With this approach we are fixing issue where item might not have some kind of rarity (like FN)
      // and we would take "null" value instead of real name id. So now we are finding existing name ID
      // and using it
      // tslint:disable-next-line:max-line-length
      itemIds: [
        ...inputItemsOnForm.map((item) =>
          item.inputItem?.normal_nameIds?.length
            ? // NOTE: If we have selected input item and it has name IDs then selecting first available that has
              // ID and returning it (More in previous comment). Otherwise if we don't have selected input item
              // then returning "null" to indicate that this slot is empty. This is needed for partial share
              // where not all slots are filled
              item.inputItem.normal_nameIds.filter((nameId) => !!nameId)[0]
            : null
        ),
      ],
      floats: [...inputItemsOnForm.map((item) => item.float)],
      prices: [...inputItemsOnForm.map((item) => item.price)],
      // Storing date when tradeup was shared
      shared: new Date(),
    };

    // Stringifying params because we need to compress STRING
    const params = JSON.stringify(tradeupShareInfo);
    // Compressing stringified object
    const compressedString = compress(params);

    // Creating byte array that we will pass as query param
    const byteArr = [];
    for (const key in compressedString) {
      if (Object.prototype.hasOwnProperty.call(compressedString, key)) {
        byteArr.push(compressedString[key]);
      }
    }

    // Creating URL tree with query params
    const urlTree = this.router.createUrlTree(['calculator'], {
      queryParams: {
        // Providing current raritry
        r: this.settings.rarity,
        // If its stattrak then providing this query param. Otherwise passing "undefined" so this
        // param won't appear in query string
        st: this.settings.stattrak ? true : undefined,
        // If steam taxes should be applied we are passing this value. Otherwise passing "undefined" so this
        // param won't appear in query string
        notax: this.settings.withoutSteamTax ? true : undefined,
        // Providing byte array with input items
        inputs: byteArr.toString(),
      },
    });
    // Storing share url for display
    const shareUrl = this.document.location.origin + urlTree.toString();
    // Storing share url for display
    this.shareUrl = shareUrl;
  }

  /**
   * Method copies tradeup share url to clip board and changes "Copy link" button to "Copied!" for 1 sec
   *
   * @memberof TradeupCalculatorActionsComponent
   */
  copyShareLink() {
    // Copying share url to clip board
    copyToClipboard(this.shareUrl);
    // Changing "Copy link" button text
    this.copyLinkDisplayText = 'Copied!';
    // After 1 sec returning "Copy link" button text back to original value
    setTimeout(() => {
      this.copyLinkDisplayText = 'Copy link';
    }, 1000);
  }

  /**
   * Method adds tradeup to results (without outcome to indicate that is not completed yet)
   *
   * @param {BestTradeup} tradeup Tradeup that should be added to results
   * @memberof TradeupCalculatorActionsComponent
   */
  addToResult() {
    // Creating new empty trade up result which we will fill
    const tradeupResult = new TradeupResult();

    // Storing basic information
    tradeupResult.stattrak = this.settings.stattrak;
    tradeupResult.received = 0;

    // Filtering only those skins that are selected and skipping empty slots.
    // This is needed for quick access
    const nonEmptyInputItems = this.inputItems.filter((skin) => Boolean(skin.inputItem));

    // Converting tradeup inputs to result format
    const tradeupInputs = nonEmptyInputItems.map(
      (skin) =>
        new TradeupInputItem({
          name: skin.inputItem.name,
          float: skin.float,
          price: skin.price,
        })
    );

    // Fillingg empty spots with empty input items so the display is more accurate
    if (tradeupInputs.length < 10) {
      const missingSpots = 10 - tradeupInputs.length;
      for (let i = 10 - missingSpots; i < 10; i++) {
        const emptyInput = new TradeupInputItem({ float: 0, name: '', price: 0 });
        tradeupInputs.push(emptyInput);
      }
    }

    // Assigning tradeup input items
    tradeupResult.inputItems = tradeupInputs;

    // Storing summary if we have it
    if (this.summary) {
      // Calculating result summary
      tradeupResult.summary = new TradeupResultSummary(tradeupResult, this.summary.cost);
      // Assigning other related information about tradeup
      tradeupResult.calculatedSummary = this.summary;
      // Storing required float value based  on calculated average float
      tradeupResult.floatRequired = this.summary.averageFloat;
    } else {
      tradeupResult.summary = new TradeupResultSummary(tradeupResult);
    }

    // Getting input iteems with float for calculation
    const inputItemsWithFloat = nonEmptyInputItems.map((item) => {
      const inputItemWithFloat = new TradeupItemWithFloat();
      inputItemWithFloat.float = item.float;
      inputItemWithFloat.item = item.inputItem;
      return inputItemWithFloat;
    });

    // Calculating tradeup summary
    const calculatedSummary = calculateTradeUp(inputItemsWithFloat, this.settings.stattrak, this.structCollections);
    // Storing trade up summary
    tradeupResult.calculatedSummary = calculatedSummary;

    // Adding result to DB
    this.sharedTradeupService.addNewResult(tradeupResult).subscribe((id) => {
      // Displaying notification
      this.toastr.success('Tradeup has been added and marked as uncompleted', 'Tradeup added to results');
    });
  }

  /**
   * Method downloads calculator inputs as .CSV file
   *
   * @memberof TradeupCalculatorActionsComponent
   */
  downloadCSV() {
    // Filtering only those skins that are selected and skipping empty slots.
    // This is needed for quick access
    const nonEmptyInputItems = this.inputItems.filter((skin) => Boolean(skin.inputItem));

    // Converting tradeup inputs to result format
    const tradeupInputs = nonEmptyInputItems.map((skin) => {
      return {
        // Adding "StatTrak™ " if its stattrak weapon for easy search
        name: `${this.settings.stattrak ? 'StatTrak™ ' : ''}${skin.inputItem.name}`,
        float: skin.float,
        price: skin.price,
      };
    });

    // Src: https://stackoverflow.com/a/51488124
    // Handling null cases
    const replacer = (key: any, value: any) => (value === null ? '' : value);
    // Getting header
    const header = Object.keys(tradeupInputs[0]);
    // Creating CSV
    const csv = tradeupInputs.map((row) =>
      header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
    );
    csv.unshift(header.join(','));
    const csvArray = csv.join('\r\n');

    // Creating anchor to download file
    const a = document.createElement('a');
    // Adding BOF for UTF-8, Excel requires this information to show chars with accents etc.
    // Src: https://github.com/marco76/export-csv/blob/master/src/exportToCSV.ts#L45
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvArray], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    // Specifying file name
    a.download = `TradeupNinja-Calculator-${new Date().getTime()}.csv`;
    // Downloading
    a.click();
    window.URL.revokeObjectURL(url);
    // Cleaning up
    a.remove();
  }

  /**
   * Function for searching collections in multiselect
   *
   * @memberof TradeupCalculatorActionsComponent
   */
  searchFn = (searchTerm: string, collection: Collection) => {
    // Converting both collection name and search term to lower cases in order
    // to find more precise resuls (Removing dots to easen the search)
    return collection.name.toLowerCase().replace(/[.]/g, '').includes(searchTerm.toLowerCase().replace(/[.]/g, ''));
  };

  emitOverviewOpening() {
    this.openOverview.emit();
  }

  /**
   * Method initializes web worker to start searching
   *
   * @private
   * @memberof TradeupCalculatorActionsComponent
   */
  private initWorker() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker = new Worker('../tradeup-calculator-search-fillers.worker', {
        type: 'module',
        name: 'Filler search',
      });
      this.worker.onmessage = ({ data }) => {
        // Handling response
        this.handleWorkerResponse(data);
      };
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
      // Displaying error message.
      this.toastr.error(
        "Can't search without Web Workers. Try using different browser or enable this feature",
        'Web workers not supported',
        { disableTimeOut: true }
      );
    }
  }

  /**
   * Method handles worker response
   *
   * @private
   * @param {WorkerResponse<any>} data Data from web worker
   * @memberof TradeupCalculatorActionsComponent
   */
  private handleWorkerResponse(data: WorkerResponse<any>) {
    if (data.progress) {
      this.searchProgress = data.progress;
    }
    if (data.data) {
      // Storing tradeups for sorting
      this.bestTradeups = data.data.bestTradeups;
    } else {
      this.bestTradeups.length = 0;
    }

    // If worker has completed its work then we can stop it
    if (data.completed) {
      // Filling calculator if we found best trade up
      if (this.bestTradeups.length) {
        // Filling calculator empty slots with items from found trade up
        this.fillCalculatorEmptySlots(this.bestTradeups[0]);
        this.toastr.success(`Fillers were added to the trade up`, 'Search completed');
      } else {
        this.toastr.warning("Didn't find any profitable fillers. Try other settings", 'Search completed');
      }
      this.stop();
    }
    // Marking that there are some changes that have to be rendered on view
    this.cdr.markForCheck();
  }

  /**
   * Method fills empty slots with found items
   *
   * @private
   * @param {BestTradeup} foundTradeup Best found trade up with input items
   * @memberof TradeupCalculatorActionsComponent
   */
  private fillCalculatorEmptySlots(foundTradeup: BestTradeup) {
    const inputItemsOnForm = this.parentForm.form.get('items').value as CalculatorInputItem[];
    // Calculating amount of empty slots in calculator
    let emptySlotAmount = inputItemsOnForm.filter((item) => !Boolean(item.inputItem)).length;

    // Walking through every input item
    for (let i = 0; i < inputItemsOnForm.length; i++) {
      // Current input slot
      const inputSlot = inputItemsOnForm[i];
      // Filling only empty slots
      if (!inputSlot.inputItem) {
        // Getting index of empty slot
        const emptySlotIndex = 10 - emptySlotAmount--;

        // Storing current item input item from found trade up input items. Using for quick access
        const inputItemAmongFillers = foundTradeup.items[emptySlotIndex];
        // Setting float and converting it to number with 7 decimals after comma (to avoid strange display)
        inputSlot.float = +inputItemAmongFillers.float.toFixed(7);
        // Setting input item
        inputSlot.inputItem = inputItemAmongFillers.item;
        // Setting float index based on float
        inputSlot.floatIndex = getFloatIndexForPrice(inputSlot.float);
        // Setting correct price based on if its stattrak tradeup or normal
        // NOTE: Converting to number with 2 decimals after comma
        inputSlot.price = +getPrice(inputItemAmongFillers.item, inputSlot.float, this.settings.stattrak).toFixed(2);

        // Getting control of current input  slot
        const currentSlotControl = this.parentForm.form.get('items.' + i);
        // Adding validators for float input based on skin params
        currentSlotControl.get('float').setValidators([
          // Setting that float is required because with "setValidators" we are assigning
          // new validators instead of appending
          Validators.required,
          // Setting min value depending on min float
          Validators.min(inputItemAmongFillers.item.min),
          // Setting max value depending on max float
          Validators.max(inputItemAmongFillers.item.max),
        ]);

        // Updating input item slot on form
        currentSlotControl.setValue(inputSlot);
      }
    }
  }

  /**
   * Method creates form group for search settings
   *
   * @private
   * @memberof TradeupCalculatorActionsComponent
   */
  private createSearchForm() {
    this.searchSettingForm = this.formBuilder.group({
      difficulty: [0.5, [Validators.min(0.01), Validators.max(0.99)]],
      minVolume: [1],
      useSingleCollection: [false],
      excludedCollections: [],
      includedCollections: [],
    });
  }
}

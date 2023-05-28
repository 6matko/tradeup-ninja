import { isPlatformServer } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Collection, RootObject, Weapon } from '@server/items';
import { ToastrService } from 'ngx-toastr';
import { SimulationData } from '../tradeup-simulation/tradeup-simulation.model';
import { TradeupSimulationService } from '../tradeup-simulation/tradeup-simulation.service';
import { TradeupSearchService } from './tradeup-search.service';
import { structurizeItemByCollection } from './tradeup-search.utils';
import { getAllSkins } from './tradeup-shared-utils';
// tslint:disable-next-line:max-line-length
import {
  BestTradeup,
  StructuredCollectionWithItems,
  TradeupFilterEnum,
  TradeupOutputMessage,
  TradeupSearchProgress,
  TradeupSearchSettings,
  WorkerResponse,
} from './tradeup.model';

@Component({
  selector: 'app-tradeup-search',
  templateUrl: './tradeup-search.component.html',
  styleUrls: ['./tradeup-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupSearchComponent implements OnInit, OnDestroy {
  /**
   * List with all output messages
   *
   * @type {TradeupOutputMessage[]}
   * @memberof TradeupSearchComponent
   */
  messages: TradeupOutputMessage[] = [];
  /**
   * List with sticky messages
   *
   * @type {TradeupOutputMessage[]}
   * @memberof TradeupSearchComponent
   */
  stickyMessages: TradeupOutputMessage[] = [];
  /**
   * Progress of tradeup search. Used for visual indication
   *
   * @type {TradeupSearchProgress}
   * @memberof TradeupSearchComponent
   */
  searchProgress: TradeupSearchProgress;
  /**
   * Settings that should be applied for searching
   *
   * @type {TradeupSearchSettings}
   * @memberof TradeupSearchComponent
   */
  searchSettings: TradeupSearchSettings = new TradeupSearchSettings();
  /**
   * Flag indicates if search or other process is processing (active)
   *
   * @type {boolean}
   * @memberof TradeupSearchComponent
   */
  isLoading: boolean;
  /**
   * List with sorted tradeups for display
   *
   * @type {BestTradeup[]}
   * @memberof TradeupSearchComponent
   */
  sortedTradeups: BestTradeup[] = [];
  /**
   * Stored items for caching
   *
   * @type {RootObject}
   * @memberof TradeupSearchComponent
   */
  storedItems: RootObject;
  /**
   * List with collections that will be used for search in primary/include/exclude lists
   *
   * @type {Collection[]}
   * @memberof TradeupSearchComponent
   */
  collectionsForSearch: Collection[] = [];
  /**
   * List with available skins for select
   *
   * @type {Weapon[]}
   * @memberof TradeupSearchComponent
   */
  skinsForSelect: Weapon[] = [];
  /**
   * List with structured collections with items in them
   *
   * @private
   * @type {StructuredCollectionWithItems[]}
   * @memberof TradeupSearchComponent
   */
  private structCollections: StructuredCollectionWithItems[] = [];
  /**
   * Latest search settings that came from settings component. This is needed to avoid messing
   * with current settings that are applied. These settings are being passed to web worker
   *
   * @private
   * @type {TradeupSearchSettings}
   * @memberof TradeupSearchComponent
   */
  private latestSearchSettings: TradeupSearchSettings = new TradeupSearchSettings();
  /**
   * Worker instance
   *
   * @private
   * @type {Worker}
   * @memberof TradeupSearchComponent
   */
  private worker: Worker;
  /**
   * Best tradeups that were found. Used to store default ordering
   *
   * @private
   * @type {BestTradeup[]}
   * @memberof TradeupSearchComponent
   */
  private bestTradeups: BestTradeup[] = [];
  constructor(
    private tradeupSearchService: TradeupSearchService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private tradeupSimulationService: TradeupSimulationService,
    @Inject(PLATFORM_ID) private platformId: string
  ) {}

  ngOnInit() {
    // Requesting item data
    this.getItems();
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }

  /**
   * Method starts tradeup search process
   *
   * @memberof TradeupSearchComponent
   */
  start() {
    if (this.worker) {
      this.stop();
    }

    // Clearing search
    this.messages.length = 0;
    this.bestTradeups.length = 0;

    // Enabling loading indicator
    this.isLoading = true;

    // Initializing worker
    this.initWorker();

    // Setting search settings
    let settings = this.latestSearchSettings;
    // If max cost is not set then setting it max available aka unlimited
    if (!this.latestSearchSettings.maxCost) {
      settings = Object.assign({}, this.latestSearchSettings, { maxCost: Number.MAX_SAFE_INTEGER });
    }

    // Starting search process
    this.worker.postMessage({
      cmd: 'start',
      items: this.storedItems,
      settings,
      structCollections: this.structCollections,
    });
  }

  /**
   * Method stops search process (Terminates worker)
   *
   * @memberof TradeupSearchComponent
   */
  stop() {
    this.worker.terminate();
    // Disabling loading indicator
    this.isLoading = false;
  }

  /**
   * Method clears logs
   *
   * @memberof TradeupSearchComponent
   */
  clearLog() {
    this.messages.length = 0;
    this.stickyMessages.length = 0;
  }

  /**
   * Method saves new search settings
   *
   * @param {TradeupSearchSettings} settings Tradeup settings for search
   * @memberof TradeupSearchComponent
   */
  saveSettings(settings: TradeupSearchSettings) {
    // Setting collections for search based on newly selected rarity
    this.setCollectionsForSearch(settings.rarity);

    // Setting collections for search based on new settings
    this.setSkinsForSelect(settings.rarity, settings.stattrak);

    // Saving settings to exclusive variable because otherwise settings get applied
    // to already found and rendered settings. Therefore it creates incorrect logic and clumsy
    // feeling. This fixes this issue because these settings are applied (passed) only when
    // user starts Search process. Web worker will receive these settings. After search process
    // completes they will be assigned to ones that are used in display and other parts
    this.latestSearchSettings = settings;
  }

  /**
   * Method sorts best tradeups by provided sort option
   *
   * @param {TradeupFilterEnum} sortOptions Sort option by which tradeups should be sorted
   * @memberof TradeupSearchComponent
   */
  sortTradeups(sortOptions: TradeupFilterEnum) {
    switch (sortOptions) {
      // By cost (Asc)
      case TradeupFilterEnum.ByCost:
        this.sortedTradeups = this.bestTradeups.sort((a, b) => a.tradeupSummary.cost - b.tradeupSummary.cost);
        break;
      // By expected value (Desc)
      case TradeupFilterEnum.ByEV:
        this.sortedTradeups = this.bestTradeups.sort(
          (a, b) => b.tradeupSummary.expectedValue - a.tradeupSummary.expectedValue
        );
        break;
      // By least of outcome item amount (First will be tradeups that have less outcome item amount) (Asc)
      case TradeupFilterEnum.ByLeastOutcomeItems:
        this.sortedTradeups = this.bestTradeups.sort(
          (a, b) => a.tradeupSummary.outcomeSummary.outcomes.length - b.tradeupSummary.outcomeSummary.outcomes.length
        );
        break;
      // By lowest amount of outcome items that are below cost
      case TradeupFilterEnum.ByLowestOutcomeItemAmount:
        this.sortedTradeups = this.bestTradeups.sort(
          (a, b) =>
            a.tradeupSummary.outcomeSummary.outcomeItemCountBelowCost -
            b.tradeupSummary.outcomeSummary.outcomeItemCountBelowCost
        );
        break;
      // By most expensive outcome prize (Desc)
      case TradeupFilterEnum.ByMostExpensiveOutcome:
        this.sortedTradeups = this.bestTradeups.sort(
          (a, b) => b.tradeupSummary.mostExpensivePrize - a.tradeupSummary.mostExpensivePrize
        );
        break;
      // By most expensive outcome odds (Desc)
      case TradeupFilterEnum.ByMostExpensiveOutcomeOdds:
        this.sortedTradeups = this.bestTradeups.sort(
          (a, b) => b.tradeupSummary.mostExpensiveOdds - a.tradeupSummary.mostExpensiveOdds
        );
        break;
      // By profit (%) (Desc)
      case TradeupFilterEnum.ByProfitPercentage:
        this.sortedTradeups = this.bestTradeups.sort(
          (a, b) => b.tradeupSummary.profitPercentage - a.tradeupSummary.profitPercentage
        );
        break;
      // By profit ($$$) (Desc)
      case TradeupFilterEnum.ByProfitValue:
        this.sortedTradeups = this.bestTradeups.sort((a, b) => b.tradeupSummary.profit - a.tradeupSummary.profit);
        break;
      // By success odds (Desc)
      case TradeupFilterEnum.BySuccessOdds:
        this.sortedTradeups = this.bestTradeups.sort(
          (a, b) => b.tradeupSummary.outcomeSummary.successOdds - a.tradeupSummary.outcomeSummary.successOdds
        );
        break;
      // By lowest loss on worst outcome
      case TradeupFilterEnum.ByLowestLossOnWorstOutcome:
        this.sortedTradeups = this.bestTradeups.sort((a, b) => {
          const firstItemProfit = a.tradeupSummary.cost - a.tradeupSummary.cheapestPrize;
          const secondItemProfit = b.tradeupSummary.cost - b.tradeupSummary.cheapestPrize;
          return firstItemProfit - secondItemProfit;
        });
        break;
      default:
        this.sortedTradeups = [...this.bestTradeups];
        break;
    }
  }

  /**
   * Method sends signal to start tradeup simulation
   *
   * @param {SimulationData} simData Simulation data
   * @memberof TradeupSearchComponent
   */
  simulateTradeup(simData: SimulationData) {
    this.tradeupSimulationService.simulateTradeupByOutcomes(simData);
  }

  /**
   * Method sets collections for search based on current rarity
   *
   * @private
   * @param {number} rarity Current rarity. Collections will be taken for this rarity
   * @memberof TradeupSearchComponent
   */
  private setCollectionsForSearch(rarity: number) {
    // Getting collections for search based on current rarity.
    // Filtering collections by rarity
    this.collectionsForSearch = this.structCollections
      .filter((col) => col.items[rarity]?.skins?.length)
      // If stattrak setting is enabled then filtering those collections that have "STATTRAK" weapons and therefore
      // ignoring collections with non-stattrak weapons
      .filter((col) =>
        this.searchSettings.stattrak ? col.items[this.searchSettings.rarity]?.skins[0]?.stattrak : true
      )
      // Taking only information about collection
      .map((col) => col.collection);
  }

  /**
   * Method sets collections for search based on current rarity
   *
   * @private
   * @param {number} rarity Current rarity. Skins will be taken for this rarity
   * @param {boolean} stattrak Indicates if its stattrak tradeup or not. Skins will be taken based on this param
   * @memberof TradeupSearchComponent
   */
  private setSkinsForSelect(rarity: number, stattrak: boolean) {
    // Getting collections for search based on current rarity.
    // Filtering collections by rarity
    this.skinsForSelect = getAllSkins(this.storedItems, stattrak, rarity, this.structCollections);
  }

  /**
   * Method gets items for search and stores them
   *
   * @private
   * @memberof TradeupSearchComponent
   */
  private getItems() {
    // Requesting items for search and starting search
    this.tradeupSearchService.getItems().subscribe(
      (data) => {
        // Storing received data (items)
        this.storedItems = data;

        // Structurize and store collections
        this.structCollections = structurizeItemByCollection(data);

        // Setting collections for search (primary/include/excludee dropdown)
        this.setCollectionsForSearch(this.searchSettings.rarity);

        // Setting skins for search/select in setting dropdown
        this.setSkinsForSelect(this.searchSettings.rarity, this.searchSettings.stattrak);

        // Marking view for re-render since we have ngIf's relying on stored items
        this.cdr.markForCheck();
      },
      (err) => {
        console.log(`Server: `, isPlatformServer(this.platformId));
        console.log(err);
        // Just in case, clearing stored item
        this.storedItems = undefined;
        this.toastr.error(null, "Could not load items. Can't start searching");
      }
    );
  }

  /**
   * Method initializes web worker to start searching
   *
   * @private
   * @memberof TradeupSearchComponent
   */
  private initWorker() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker = new Worker('./tradeup-search.worker', { type: 'module' });
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
   * @memberof TradeupSearchComponent
   */
  private handleWorkerResponse(data: WorkerResponse<any>) {
    const msg = new TradeupOutputMessage(data);

    if (data.progress) {
      this.searchProgress = data.progress;
    }

    data.insertAtStart ? this.messages.unshift(msg) : this.messages.push(msg);

    this.stickyMessages = [...this.messages.filter((message) => !!message.sticky)];

    if (data.data) {
      // Storing tradeups for sorting
      this.bestTradeups = data.data.bestTradeups;
      // Storing tradeups for display
      this.sortedTradeups = [...this.bestTradeups];
    } else {
      this.bestTradeups.length = 0;
      this.sortedTradeups.length = 0;
    }

    // If worker has completed its work then we can stop it
    if (data.completed) {
      // Assigning latest changes to current via Object.assign to avoid references
      this.searchSettings = Object.assign({}, this.latestSearchSettings);
      // Displaying notifications
      if (this.bestTradeups.length) {
        this.toastr.success(`${this.bestTradeups.length} tradeups found`, 'Search completed');
      } else {
        this.toastr.warning('0 tradeups were found', 'Search completed');
      }
      this.stop();
    }
    // Marking that there are some changes that have to be rendered on view
    this.cdr.markForCheck();
  }
}

import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ToastrService } from 'ngx-toastr';
import { from, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getDateWithoutTime } from '../@core/utils';
import { SharedTradeupService } from '../@shared/shared-tradeup/shared-tradeup.service';
import { UserPreferencesLoaderService } from '../user-preferences/user-preferences-loader.service';
import { UserPreferences } from '../user-preferences/user-preferences.model';
import { AddEditResultModalComponent } from './add-edit-result-modal/add-edit-result-modal.component';
import { ResultCollectionStats } from './result-collection-stats/result-collection-stats.model';
import { ResultFilter } from './tradeup-result-filter/tradeup-result-filter.model';
import { TradeupResultSortEnum } from './tradeup-result-sort/tradeup-result-sort.model';
import { TradeupOverallSummary, TradeupResult } from './tradeup-result.model';

@Component({
  selector: 'app-tradeup-result',
  templateUrl: './tradeup-result.component.html',
  styleUrls: ['./tradeup-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupResultComponent implements OnInit, OnDestroy {
  /**
   * List with sorted tradeups. Used for display
   *
   * @type {TradeupResult[]}
   * @memberof TradeupResultComponent
   */
  sortedResults: TradeupResult[] = [];
  /**
   * Overall tradeup summary
   *
   * @type {TradeupOverallSummary}
   * @memberof TradeupResultComponent
   */
  summary: TradeupOverallSummary;
  /**
   * Indicates if stats should be shown
   *
   * @type {boolean}
   * @memberof TradeupResultComponent
   */
  showStats: boolean;
  /**
   * Collections stats about tradeup results
   *
   * @type {ResultCollectionStats[]}
   * @memberof TradeupResultComponent
   */
  collectionStats: ResultCollectionStats[];
  /**
   * Reference to file input of tradeup result import
   *
   * @type {ElementRef}
   * @memberof TradeupResultComponent
   */
  @ViewChild('importInput') importInput: ElementRef;
  /**
   * List with uncompleted results
   *
   * @type {TradeupResult[]}
   * @memberof TradeupResultComponent
   */
  uncompletedResults: TradeupResult[] = [];
  /**
   * View type. Either **chart** or either **stats**
   *
   * @type {('chart' | 'stats')}
   * @memberof TradeupResultComponent
   */
  viewType: 'chart' | 'stats' = 'chart';
  /**
   * List with all tradeup results
   *
   * @type {TradeupResult[]}
   * @memberof TradeupResultComponent
   */
  results: TradeupResult[] = [];
  /**
   * Flag indicates if additional stats are expanded
   *
   * @type {boolean}
   * @memberof TradeupResultComponent
   */
  statsExpanded: boolean;
  /**
   * Flag indicates additional information is collapsed
   *
   * @type {boolean}
   * @memberof TradeupResultComponent
   */
  collapsed: boolean;
  /**
   * User preferences
   *
   * @type {UserPreferences}
   * @memberof TradeupResultComponent
   */
  userPreferences: UserPreferences;
  /**
   * Stored tradeup result filter settings
   *
   * @private
   * @type {ResultFilter}
   * @memberof TradeupResultComponent
   */
  private currentFilterSettings: ResultFilter;
  /**
   * Subscription that watches for user preference changes
   *
   * @private
   * @type {Subscription}
   * @memberof TradeupResultComponent
   */
  private preferenceChangeSubscription: Subscription = Subscription.EMPTY;
  constructor(
    private modalService: NgbModal,
    private ngxIndexedDB: NgxIndexedDBService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private sharedTradeupService: SharedTradeupService,
    @Inject(PLATFORM_ID) private platformId: string,
    private userPreferencesService: UserPreferencesLoaderService
  ) {
    // Storing user preferences for quick access
    this.userPreferences = this.userPreferencesService.getPreferences();
  }

  ngOnInit() {
    // Getting results only if platform is browser because server doesn't know
    // anything about indexedDB and data in there
    if (isPlatformBrowser(this.platformId)) {
      this.sharedTradeupService.getResults().subscribe((results: TradeupResult[]) => {
        // Initializing results for display
        this.initResultsForDisplay(results);
      });
    }

    // Subscribing to user preference change in order to update them
    this.preferenceChangeSubscription = this.userPreferencesService.userPreferenceChange$.subscribe((prefs) => {
      // Updating preferences
      this.userPreferences = prefs;
      // Marking that view has to be re-rendered because there are changes
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.preferenceChangeSubscription.unsubscribe();
  }

  /**
   * Method toggles view (chart or items)
   *
   * @memberof TradeupResultComponent
   */
  toggleView() {
    // If current view is chart then changing to items and vice versa
    this.viewType = this.viewType === 'chart' ? 'stats' : 'chart';
  }

  /**
   * Method exports results from IndexedDB to JSON file and downloads it
   *
   * @memberof TradeupResultComponent
   */
  exportResults() {
    // Src: https://stackoverflow.com/a/47114952
    const resultsJson = JSON.stringify(this.results);
    const blob = new Blob([resultsJson], { type: 'text/json' });
    const url = window.URL.createObjectURL(blob);

    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', 'tradeup-results.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    // Simulating click
    element.click();
    document.body.removeChild(element);
  }

  /**
   * Method imports tradeup results from previously
   *
   * @param {Event} evt File input change event (contains files)
   * @memberof TradeupResultComponent
   */
  importResults(evt: InputEvent) {
    // Storing files in input for quick access
    const files = (evt.target as any).files;
    // Displaying error if no files were selected for import
    if (files.length !== 1) {
      this.toastr.warning('Please select import file with tradeups', 'Import file not selected');
    } else {
      const reader = new FileReader();
      // Waiting for file to be imported
      reader.onloadend = (e) => {
        try {
          // Handle data processing
          const data = JSON.parse(reader.result.toString()) as TradeupResult[];
          // Clearing results before inserting new ones because otherwise
          // there won't be a way how to identify "new" and "old"
          from(this.ngxIndexedDB.clear('result'))
            .pipe(
              switchMap(() => {
                // Adding new results one by one and combining them into promises
                const promises = data.map((result) => {
                  return this.sharedTradeupService.addNewResult(result);
                });
                // Returning Observable with all promises so we can
                return from(Promise.all(promises)).pipe(switchMap((results) => this.sharedTradeupService.getResults()));
              })
            )
            .subscribe((results) => {
              // Initializing results for display
              this.initResultsForDisplay(results);
              // Clearing input after import was successful. We need to do it
              // because otherwise user won't be able to import the same file
              // because technically it will be already "in input"
              this.importInput.nativeElement.value = '';
              // Displaying notification that tradeups were successfully imported
              this.toastr.success(null, 'Tradeups imported');
            });
        } catch (error) {
          console.error(`Could not import`);
          this.toastr.error(
            `There was an unknown error while importing tradeups. Maybe your tradeup file is corrupted`,
            'Import failed'
          );
        }
      };
      // Reading files from input
      reader.readAsText(files[0]);
    }
  }

  /**
   * Method adds modal for adding new tradeup result and on success adds it to list
   *
   * @memberof TradeupResultComponent
   */
  openAddNewResultModal() {
    const modalRef = this.modalService.open(AddEditResultModalComponent, {
      size: 'lg',
    });
    modalRef.result.then(
      (newResult) => {
        this.results.push(newResult);
        this.sortedResults.push(newResult);
        // Calculating summary after changes
        this.calculateSummary();
      },
      () => {}
    );
  }

  /**
   * Method updates results value in list by replacing it with new one
   *
   * @param {TradeupResult} updatedResult Updated result
   * @param {number} index Index of result that has to be replaced with new one
   * @memberof TradeupResultComponent
   */
  updateResult(updatedResult: TradeupResult, index: number) {
    Object.assign(this.sortedResults[index], updatedResult);
    // Calculating summary after changes
    this.calculateSummary();
    // Displaying notification
    this.toastr.success(null, 'Tradeup updated');
  }

  /**
   * Method removes result from list by its ID
   *
   * @param {number} resultId Id of result that has to be removed
   * @memberof TradeupResultComponent
   */
  removeResult(resultId: number) {
    // Searching for index of result that has to be removed by its ID
    const removableResultIndex = this.results.findIndex((result) => result.id === resultId);
    // If result was found then removing it
    if (removableResultIndex !== -1) {
      this.results.splice(removableResultIndex, 1);
      // Calculating summary after changes
      this.calculateSummary();
      // Sorting by default
      this.sortResults(0);
      // Displaying notification
      this.toastr.info(null, 'Tradeup removed');
    }
  }

  /**
   * Method sorts best tradeups by provided sort option
   *
   * @param {TradeupFilterEnum} sortOptions Sort option by which tradeups should be sorted
   * @memberof TradeupResultComponent
   */
  sortResults(sortOptions: TradeupResultSortEnum) {
    switch (sortOptions) {
      // By cost (Asc)
      case TradeupResultSortEnum.ByCost:
        this.sortedResults = this.sortedResults.sort((a, b) => a.summary.cost - b.summary.cost);
        break;
      // By expected value (Desc)
      case TradeupResultSortEnum.ByEV:
        this.sortedResults = this.sortedResults.sort(
          (a, b) => b.calculatedSummary.expectedValue - a.calculatedSummary.expectedValue
        );
        break;
      // By profit (Desc)
      case TradeupResultSortEnum.ByProfit:
        this.sortedResults = this.sortedResults.sort((a, b) => b.summary.profit - a.summary.profit);
        break;
      // By current tradeup profit (%) (Desc)
      case TradeupResultSortEnum.ByCurrentProfitPercentage:
        this.sortedResults = this.sortedResults.sort(
          (a, b) => b.calculatedSummary.profitPercentage - a.calculatedSummary.profitPercentage
        );
        break;
      // By current tradeup success odds (Desc)
      case TradeupResultSortEnum.ByCurrentSuccessOdds:
        this.sortedResults = this.sortedResults.sort(
          (a, b) => b.calculatedSummary.outcomeSummary.successOdds - a.calculatedSummary.outcomeSummary.successOdds
        );
        break;
      // By date when tradeup was completed (Desc)
      case TradeupResultSortEnum.ByCompleteDate:
        this.sortedResults = this.sortedResults.sort(
          (a, b) => new Date(b.completed).getTime() - new Date(a.completed).getTime()
        );
        break;
      // By date when tradeup was modified (Desc)
      case TradeupResultSortEnum.ByModifyDate:
        this.sortedResults = this.sortedResults.sort(
          (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()
        );
        break;
      // By date when tradeup was created (Desc)
      case TradeupResultSortEnum.ByCreateDate:
        this.sortedResults = this.sortedResults.sort(
          (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
        );
        break;
      default:
        this.sortedResults = [...this.sortedResults];
        break;
    }
  }

  /**
   * Method displays outcome stats by collections (overlay window)
   *
   * @memberof TradeupResultComponent
   */
  displayStats() {
    this.showStats = true;
    this.cdr.markForCheck();
  }

  /**
   * Method toggles additional information collapse state
   *
   * @memberof TradeupResultComponent
   */
  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  /**
   * Method filters tradeup results by provided filtering settings
   *
   * @param {ResultFilter} [filter=new ResultFilter()] Filtering settings. By default takes initial filtering values
   * @memberof TradeupResultComponent
   */
  filterResults(filter: ResultFilter = new ResultFilter()) {
    // Storing current filtering settings so we could do same filtering on any change (add/remove/update)
    this.currentFilterSettings = filter;
    // Initally taking all results
    let filtered: TradeupResult[] = [...this.results];

    // Doing filtering
    filtered = this.filterByDate(filtered, filter);
    filtered = this.filterCompletedUncompleted(filtered, filter);
    filtered = this.filterByRarities(filtered, filter);
    filtered = this.filterStattrakNormal(filtered, filter);
    filtered = this.filterSuccessfulOrFailed(filtered, filter);
    filtered = this.filterByText(filtered, filter);

    // Storing filtered results
    this.sortedResults = [...filtered];
  }

  /**
   * Method initializes results for display by storing them and calling appropriate methods
   *
   * @private
   * @param {TradeupResult[]} results Tradeup results
   * @memberof TradeupResultComponent
   */
  private initResultsForDisplay(results: TradeupResult[]) {
    // Storing tradeup results for display
    this.results = results;
    // Copying results to avoid references
    this.sortedResults = [...new Set(results)];

    // Getting list with uncompleted results (Results that have no outcome)
    this.uncompletedResults = results.filter((res) => !res.outcome);

    // Method calculates summary for tradeup results
    this.calculateSummary();
    this.calculateStats();
  }

  /**
   * Method calculates statistics information
   *
   * @private
   * @memberof TradeupResultComponent
   */
  private calculateStats() {
    const stats: ResultCollectionStats[] = [];
    this.results
      // Filtering only profitable and COMPLETE (with outcome) tradeups
      .filter((result) => result.summary?.profit > 0 && result.outcome?.name)
      .forEach((result) => {
        // Searching for existing collections (that are already in list)
        const collectionInStats = stats.find((st) => st.collection?.key === result.outcome.collection.key);
        // If collection was found then increasing profitable tradeup amount counter because we already have profitable tradeup in this collection
        if (collectionInStats) {
          collectionInStats.profitableTradeupAmount++;
        } else {
          // Otherwise adding new collection to profitable outcomes by collection
          stats.push(new ResultCollectionStats(result.outcome.collection));
        }
      });
    // Sorting array by Desc
    stats.sort((a, b) => b.profitableTradeupAmount - a.profitableTradeupAmount);
    this.collectionStats = stats;
  }

  /**
   * Method calculates overall summary of tradeups
   *
   * @private
   * @param {TradeupResult[]} results Tradeup results
   * @memberof TradeupResultComponent
   */
  private calculateSummary() {
    // Creating variable that will store overall summary
    const overallSummary = new TradeupOverallSummary();

    // Doing calculations ONLY if we have results to work with
    if (this.results.length) {
      // Walking through each result and doing according summarization
      for (const result of this.results) {
        // Taking into calculation only results that have outcome because
        // those can be considered as "done" aka "completed"
        if (result.outcome) {
          // Increasing amount of tradeups done
          overallSummary.total++;
          // Summing amount of spent money
          overallSummary.totalSpent += result.summary.cost;
          // Summing amount of received money
          overallSummary.totalReceived += result.received;
          // Summing amount of stattrak tradeups.
          // If result is stattrak then converting boolean to number (1 or 0) and summing it
          overallSummary.stattrakTradeupAmount += +result.stattrak;
          // If tradeup profit is > 0 then summing as succesful tradeup
          overallSummary.successfulTradeupAmount += +(result.summary.profit > 0);
          // Determining if current result has the worst profit
          overallSummary.mostLoss =
            overallSummary.mostLoss > result.summary.profit ? result.summary.profit : overallSummary.mostLoss;
          // Determining if current result has the best profit
          overallSummary.mostProfit =
            overallSummary.mostProfit < result.summary.profit ? result.summary.profit : overallSummary.mostProfit;

          // // Searching for outcome information
          // const outcomeInfo = result.calculatedSummary.outcomeSummary.outcomes
          //   .find(outcome => outcome.item.name.toLowerCase() === result.outcome.name.toLowerCase());
          // if (outcomeInfo) {
          //   if(bestOutcome) {
          //     bestOutcome = bestOutcome.item.
          //   }
          // }
        }
      }
      // Calculating profit
      overallSummary.profit = overallSummary.totalReceived - overallSummary.totalSpent;
      // Calculating average tradeup cost
      overallSummary.averageCost = overallSummary.totalSpent / overallSummary.total;
      overallSummary.averageProfit = overallSummary.totalReceived / overallSummary.total;
      // Calculating percentage of stattrak tradeups
      overallSummary.stattrakTradeupAmountPercentage = overallSummary.stattrakTradeupAmount / overallSummary.total;
      // Calculating percentage of successful tradeups
      overallSummary.successfulTradeupAmountPercentage = overallSummary.successfulTradeupAmount / overallSummary.total;

      // Setting summary for display
      this.summary = overallSummary;
      // Marking our view for check since we updated our summary
    } else {
      // Storing empty summary since there are no results. We need to do it
      // to stop loading indicator from display
      this.summary = overallSummary;
    }
    // Initially filtering results
    this.filterResults(this.currentFilterSettings);
    // Marking view for check
    this.cdr.markForCheck();
  }

  /**
   * Method filters results by filter text
   *
   * @private
   * @param {TradeupResult[]} arr Tradeup result list
   * @param {ResultFilter} filter Filter settings
   * @returns {TradeupResult[]} Returns filtered tradeup results
   * @memberof TradeupResultComponent
   */
  private filterByText(arr: TradeupResult[], filter: ResultFilter): TradeupResult[] {
    // If there is no filter text set then returning the same array
    if (!filter.filterText) {
      return arr;
    } else {
      // Storing filter text in lower case for quick access (Removing dots to easen the search)
      const filterText = filter.filterText.toLowerCase().replace(/[.]/g, '');
      return arr.filter(
        (result) =>
          // Filtering by tradeup name
          result.tradeupName?.toLowerCase().includes(filterText) ||
          // Or by outcome skin name (Replacing dots to easen the search)
          result.outcome?.name.toLowerCase().replace(/[.]/g, '').includes(filterText) ||
          // Or by outcome collection name (Replacing dots to easen the search)
          result.outcome?.collection?.name.toLowerCase().replace(/[.]/g, '').includes(filterText)
      );
    }
  }

  /**
   * Method filters tradeups by outcome rarity.
   * If filtering is done by "NOT COMPLETED" as well then they will be taken as well
   *
   * @private
   * @param {TradeupResult[]} arr Tradeup result list
   * @param {ResultFilter} filter Filter settings
   * @returns {TradeupResult[]} Returns filtered tradeup results
   * @memberof TradeupResultComponent
   */
  private filterByRarities(arr: TradeupResult[], filter: ResultFilter): TradeupResult[] {
    // Storing boolean if both completed and uncompleted options were selected. We need it for quick access
    const bothCompletedAndUncompletedSelected =
      (filter.completed && filter.incomplete) || (!filter.completed && !filter.incomplete);

    // If no rarities were selected then returning the same list
    if (!filter.rarities?.length) {
      return arr;
    } else {
      // Filtering completed tradeups by selected rarities
      const completedArrByRarities = arr.filter(
        (result) => result.outcome && filter.rarities.includes(result.outcome.rarity - 1)
      );
      // If both COMPLETED and UNCOMPLETED options are selected then returning completed tradeups that can be filtered by rarities
      // and those that are uncompleted since don't know their rarity
      if (bothCompletedAndUncompletedSelected) {
        return [...completedArrByRarities, ...arr.filter((result) => !result.outcome?.name)];
        // If only COMPLETED tradeups are needed then returning completed tradeups that were filtered by rarity
      } else if (filter.completed) {
        return completedArrByRarities;
        // Otherwise returning all uncompleted results since we don't know anything about their rarity
      } else {
        return arr.filter((result) => !result.outcome?.name);
      }
    }
  }

  /**
   * Method filters tradeup results by date
   *
   * @private
   * @param {TradeupResult[]} arr Tradeup result list
   * @param {ResultFilter} filter Filter settings
   * @returns {TradeupResult[]} Returns filtered tradeup results
   * @memberof TradeupResultComponent
   */
  private filterByDate(arr: TradeupResult[], filter: ResultFilter): TradeupResult[] {
    // If date range (for some reason) is not set then returning the same array
    if (!filter.completedRange?.start && !filter.completedRange?.end) {
      return arr;
      // If option "Show uncompleted" is enabled
    } else if (filter.incomplete) {
      // If option to show uncompleted results is enabled then filtering uncompleted results
      // and afterwards filtering for results that comply provided date range settings
      return arr.filter(
        (result) =>
          !result.outcome?.name ||
          (getDateWithoutTime(result.completed) >= getDateWithoutTime(filter.completedRange.start) &&
            getDateWithoutTime(result.completed) <= getDateWithoutTime(filter.completedRange.end))
      );
    } else {
      // Otherwise we are ignoring uncompleted tradeup results because they don't have completed date
      // and filtering only those that have
      return arr.filter(
        (result) =>
          getDateWithoutTime(result.completed) >= getDateWithoutTime(filter.completedRange.start) &&
          getDateWithoutTime(result.completed) <= getDateWithoutTime(filter.completedRange.end)
      );
    }
  }

  /**
   * Method filters tradeups by their completion status (Completed if have outcome and Uncompleted if don't have)
   *
   * @private
   * @param {TradeupResult[]} arr Tradeup result list
   * @param {ResultFilter} filter Filter settings
   * @returns {TradeupResult[]} Returns filtered tradeup results
   * @memberof TradeupResultComponent
   */
  private filterCompletedUncompleted(arr: TradeupResult[], filter: ResultFilter): TradeupResult[] {
    // If both options are selected or unselected then returning the same array
    if ((filter.completed && filter.incomplete) || (!filter.completed && !filter.incomplete)) {
      return arr;
      // Filtering only completed tradeups (those that have outcome)
    } else if (filter.completed) {
      return arr.filter((result) => result.outcome?.name);
    } else {
      // Filtering only uncompleted outcomes (those that DONT have outcome)
      return arr.filter((result) => !result.outcome?.name);
    }
  }

  /**
   * Method filters tradeups by type (Stattrak or Normal)
   *
   * @private
   * @param {TradeupResult[]} arr Tradeup result list
   * @param {ResultFilter} filter Filter settings
   * @returns {TradeupResult[]} Returns filtered tradeup results
   * @memberof TradeupResultComponent
   */
  private filterStattrakNormal(arr: TradeupResult[], filter: ResultFilter): TradeupResult[] {
    // If both options are selected or non selected then returning same results
    if ((filter.stattrak && filter.normal) || (!filter.stattrak && !filter.normal)) {
      return arr;
      // Filtering only stattrak results
    } else if (filter.stattrak) {
      return arr.filter((result) => result.stattrak);
    } else {
      // Filtering only normal results
      return arr.filter((result) => !result.stattrak);
    }
  }

  /**
   * Method filters by outcome result (Successful or Failed)
   *
   * @private
   * @param {TradeupResult[]} arr Tradeup result list
   * @param {ResultFilter} filter Filter settings
   * @returns {TradeupResult[]} Returns filtered tradeup results
   * @memberof TradeupResultComponent
   */
  private filterSuccessfulOrFailed(arr: TradeupResult[], filter: ResultFilter): TradeupResult[] {
    // If both options are selected or non selected then returning same results
    if ((filter.successful && filter.failed) || (!filter.successful && !filter.failed)) {
      return arr;
      // Filtering only successful tradeups (profit is above or equal to 0)
    } else if (filter.successful) {
      return arr.filter((result) => result.summary?.profit >= 0);
    } else {
      // Filtering only failed tradeups (negative profit)
      return arr.filter((result) => result.summary?.profit < 0);
    }
  }
}

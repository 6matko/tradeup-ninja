import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Weapon } from '@server/items';
import { compress } from 'lzutf8';
import { ToastrService } from 'ngx-toastr';
import { copyToClipboard } from '../../@core';
import { SharedTradeupService } from '../../@shared/shared-tradeup/shared-tradeup.service';
import { TradeupFromSearchForCalculation } from '../../tradeup-calculator/tradeup-calculator.model';
import { TradeupInputItem, TradeupResult, TradeupResultSummary } from '../../tradeup-result/tradeup-result.model';
import { SimulationData } from '../../tradeup-simulation/tradeup-simulation.model';
import { TradeupSimulationService } from '../../tradeup-simulation/tradeup-simulation.service';
import { TradeupShareInfo } from '../tradeup-share-display/tradeup-share-display.model';
import { getDistinctInputItems, getPrice, getRarityName, getVolume } from '../tradeup-shared-utils';
import { BestTradeup, TradeupSearchSettings } from '../tradeup.model';
import { InputItemsForDisplay } from './tradeup-display.model';

@Component({
  selector: 'app-tradeup-display',
  templateUrl: './tradeup-display.component.html',
  styleUrls: ['./tradeup-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // // We need this in order to override popover styles via scss
  // encapsulation: ViewEncapsulation.None,
})
export class TradeupDisplayComponent implements OnInit {
  /**
   * Tradeup for display
   *
   * @type {BestTradeup}
   * @memberof TradeupDisplayComponent
   */
  @Input() tradeup: BestTradeup = new BestTradeup();
  /**
   * Indicates if this is stattrak tradeup
   *
   * @type {boolean}
   * @memberof TradeupDisplayComponent
   */
  @Input() stattrak: boolean;
  /**
   * Tradeup number for display
   *
   * @type {number}
   * @memberof TradeupDisplayComponent
   */
  @Input() tradeupNr: number;
  /**
   * Should prices be compared without steam tax or WITH steam tax. If this flag is set to `true` then
   * prices will be taken without steam tax
   *
   * @type {boolean}
   * @memberof TradeupDisplayComponent
   */
  @Input() compareWithoutSteamTax: boolean;
  /**
   * Flag indicates if share button should be hidden
   *
   * @type {boolean}
   * @memberof TradeupDisplayComponent
   */
  @Input() hideShare: boolean;
  /**
   * Skin that has to be previewed
   *
   * @type {Weapon}
   * @memberof TradeupDisplayComponent
   */
  previewSkin: Weapon;
  /**
   * Distinct input items that are used for display (including Amount property)
   *
   * @type {InputItemsForDisplay[]}
   * @memberof TradeupDisplayComponent
   */
  distinctInputItems: InputItemsForDisplay[];
  /**
   * Url for sharing
   *
   * @type {string}
   * @memberof TradeupDisplayComponent
   */
  shareUrl: string;
  /**
   * Text that is displayed in "Copy link" button
   *
   * @type {string}
   * @memberof TradeupDisplayComponent
   */
  copyLinkDisplayText: string = 'Copy link';
  constructor(
    private cdr: ChangeDetectorRef,
    private sharedTradeupService: SharedTradeupService,
    private toastr: ToastrService,
    private tradeupSimulationService: TradeupSimulationService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    // Getting only distinct input items for tradeup and counting their amount
    // so we could display not 10 items (including duplicates) but only a few distinct
    // with amount column to represent how many of specific item is needed
    this.distinctInputItems = getDistinctInputItems(this.tradeup.items);
  }

  /**
   * Method gets price for specific skin based on its float
   *
   * @param {Weapon} skin Skin
   * @param {number} float Skin float
   * @param {boolean} [withoutTax] Optional flag that will return skin price without steam tax
   * @returns {number} Returns skin price
   * @memberof TradeupDisplayComponent
   */
  getSkinPrice(skin: Weapon, float: number, withoutTax?: boolean): number {
    return getPrice(skin, float, this.stattrak, withoutTax);
  }

  /**
   * Method gets rarity name by value and returns it
   *
   * @param {number} rarity Rarity value
   * @returns {string} Returns rarity name
   * @memberof TradeupDisplayComponent
   */
  getSkinRarityName(rarity: number): string {
    return getRarityName(rarity);
  }

  /**
   * Method gets items float and returns it
   *
   * @param {Weapon} item Skin which float we need to get
   * @param {number} float Float of skin to get correct volume based on condition
   * @returns {number} Returns volume
   * @memberof TradeupDisplayComponent
   */
  getVolume(item: Weapon, float: number): number {
    return getVolume(item, float, this.stattrak);
  }

  /**
   * Method adds tradeup to results (without outcome to indicate that is not completed yet)
   *
   * @param {BestTradeup} tradeup Tradeup that should be added to results
   * @memberof TradeupDisplayComponent
   */
  addToResult(tradeup: BestTradeup) {
    const tradeupResult = new TradeupResult();
    // Converting tradeup inputs to result format
    const tradeupInputs = tradeup.items.map(
      (skin) =>
        new TradeupInputItem({
          name: skin.item.name,
          float: skin.float,
          price: this.getSkinPrice(skin.item, skin.float),
        })
    );
    // Assigning tradeup input items
    tradeupResult.inputItems = tradeupInputs;
    // Calculating result summary
    tradeupResult.summary = new TradeupResultSummary(tradeupResult, tradeup.tradeupSummary.cost);
    // Assigning other related information about tradeup
    tradeupResult.calculatedSummary = tradeup.tradeupSummary;
    tradeupResult.stattrak = this.stattrak;
    tradeupResult.received = 0;
    // Storing required float value based  on calculated average float
    tradeupResult.floatRequired = tradeup.tradeupSummary.averageFloat;

    // Adding result to DB
    this.addNewResult(tradeupResult);
  }

  /**
   * Method opens simulation menu for selected tradeup
   *
   * @param {BestTradeup} tradeup Tradeup information for which simulation should be done
   * @memberof TradeupDisplayComponent
   */
  simulateTradeup(tradeup: BestTradeup) {
    // Creating object with basic information for simulation
    const simData = new SimulationData();
    simData.cost = tradeup.tradeupSummary.cost;
    simData.outcomes = tradeup.tradeupSummary.outcomeSummary.outcomes;
    simData.stattrak = this.stattrak;
    // Simulating tradeup
    this.tradeupSimulationService.simulateTradeupByOutcomes(simData);
  }

  /**
   * Method creats and stores share link for current tradeup
   *
   * @memberof TradeupDisplayComponent
   */
  createShareLink() {
    // Creating object that we will compress and pass as query param
    const tradeupShareInfo: TradeupShareInfo = {
      // Filtering name IDs list only to those values that have nameId (truthy value)
      // and after filtering we take first because we need the name ID. They are identical in list.
      // With this approach we are fixing issue where item might not have some kind of rarity (like FN)
      // and we would take "null" value instead of real name id. So now we are finding existing name ID
      // and using it
      itemIds: [...this.tradeup.items.map((item) => item.item.normal_nameIds.filter((nameId) => !!nameId)[0])],
      floats: [...this.tradeup.items.map((item) => item.float)],
      stattrak: this.stattrak,
      noTax: this.compareWithoutSteamTax,
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
    const urlTree = this.router.createUrlTree(['share'], { queryParams: { tradeup: byteArr.toString() } });
    // Storing share url for display
    this.shareUrl = this.document.location.origin + urlTree.toString();
  }

  /**
   * Method copies tradeup share url to clip board and changes "Copy link" button to "Copied!" for 1 sec
   *
   * @memberof TradeupDisplayComponent
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
   * Method redirects user to calculator with current tradeup information so it could be recreated
   *
   * @memberof TradeupDisplayComponent
   */
  openInCalculator() {
    const dtoForCalculator = new TradeupFromSearchForCalculation();
    // Storing current tradeup
    dtoForCalculator.tradeup = this.tradeup;
    // Creating empty search settings
    dtoForCalculator.settings = new TradeupSearchSettings();
    // Filing settings with basic information
    dtoForCalculator.settings.stattrak = this.stattrak;
    dtoForCalculator.settings.compareWithoutTax = this.compareWithoutSteamTax;
    dtoForCalculator.settings.rarity = this.tradeup.items[0].item.rarity.value;

    // Redirecting user to calculator and passing current state for tradeup recreation in calculator
    this.router.navigate(['calculator'], { state: dtoForCalculator });
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
      // Displaying notification
      this.toastr.success('Tradeup has been added and marked as uncompleted', 'Tradeup added to results');
    });
  }
}

import { Collection, RootObject, Weapon } from '@server/items';
import { InventoryItem } from '../inventory/inventory.model';
import { CalculatorInputItem } from '../tradeup-calculator/tradeup-calculator.model';
import { getPrice } from './tradeup-shared-utils';

export type Wear = 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';
/**
 * Generic trade up settings
 *
 * @export
 * @interface ITradeupSettings
 */
export interface ITradeupSettings {
  /**
   * Is tradeup stattrak or normal
   *
   * @type {boolean}
   * @memberof ITradeupSettings
   */
  stattrak?: boolean;
  /**
   * Should prices be taken without steam tax
   *
   * @type {boolean}
   * @memberof ITradeupSettings
   */
  withoutSteamTax?: boolean;
  /**
   * Rarity value
   *
   * @type {number}
   * @memberof ITradeupSettings
   */
  rarity?: number;
}

/**
 * Progress of tradeup search
 *
 * @export
 * @class TradeupSearchProgress
 */
export class TradeupSearchProgress {
  total: number;
  current: number;
  /**
   * Progress percentage
   *
   * @type {number}
   * @memberof TradeupSearchProgress
   */
  progress: number;
  constructor(total?: number, current?: number) {
    if (total && current) {
      this.total = total;
      this.current = current;
      this.progress = current / total;
    }
  }
}
/**
 * Response from worker
 *
 * @export
 * @class WorkerResponse
 * @template T
 */
export class WorkerResponse<T> {
  /**
   * Message to display in output
   *
   * @type {string}
   * @memberof WorkerResponse
   */
  msg: string;
  /**
   * Data for search component
   *
   * @type {T}
   * @memberof WorkerResponse
   */
  data?: T;
  /**
   * Flag indicates if content (text) is HTML
   *
   * @type {boolean}
   * @memberof WorkerResponse
   */
  isHTML: boolean;
  /**
   * Search progress report
   *
   * @type {TradeupSearchProgress}
   * @memberof WorkerResponse
   */
  progress?: TradeupSearchProgress;
  /**
   * Indicates if message should be added to start of the list
   *
   * @type {boolean}
   * @memberof WorkerResponse
   */
  insertAtStart?: boolean;
  /**
   * Indicates if message is sticky and should be displayed at the start
   *
   * @type {boolean}
   * @memberof WorkerResponse
   */
  sticky?: boolean;
  /**
   * Flag indicates if worker has completed his work and can be terminateed
   *
   * @type {boolean}
   * @memberof WorkerResponse
   */
  completed?: boolean;
  constructor(initData?: WorkerResponse<T>) {
    if (initData) {
      Object.assign(this, initData);
    }
  }
}

export class TradeupOutputMessage {
  /**
   * Output text
   *
   * @type {string}
   * @memberof TradeupOutputMessage
   */
  text: string;
  /**
   * Flag indicates if content (text) is HTML
   *
   * @type {boolean}
   * @memberof TradeupOutputMessage
   */
  isHTML: boolean;
  /**
   * Class that should be applied to message
   *
   * @type {string}
   * @memberof TradeupOutputMessage
   */
  class: string;
  /**
   * Additional data for output
   *
   * @type {any}
   * @memberof TradeupOutputMessage
   */
  data: any;
  /**
   * Flag indicates if message is sticky and should not be cleared
   *
   * @type {boolean}
   * @memberof TradeupOutputMessage
   */
  sticky: boolean;
  constructor(data: WorkerResponse<any>) {
    if (data) {
      this.text = data.msg;
      this.isHTML = data.isHTML;
      this.data = data.data;
      this.sticky = data.sticky;
    }
  }
}

export interface DataObj {
  cmd: 'start' | 'stop';
  items: RootObject;
  /**
   * Structurized collections with items
   *
   * @type {StructuredCollectionWithItems[]}
   * @memberof DataObj
   */
  structCollections?: StructuredCollectionWithItems[];
  /**
   * Input items from calculator
   *
   * @type {CalculatorInputItem[]}
   * @memberof DataObj
   */
  inputItems?: CalculatorInputItem[];
  settings: TradeupSearchSettings;
  msg: string;
}

export class CollectionItemWithInfo {
  avgPricesNormal: number[] = [];
  avgPricesST: number[] = [];
  skins: Weapon[] = [];
}

export interface StructuredCollectionWithItems {
  collection: Collection;
  items: { [rarityValue: string]: CollectionItemWithInfo };
}

export class StucturedItemsByRarity {
  [rarity: string]: Weapon[];
}

export enum WeaponWear {
  'FactoryNew' = 0,
  'MinimalWear',
  'FieldTested',
  'WellWorn',
  'BattleScarred',
}

export class TradeupItemWithFloat {
  item: Weapon;
  float: number;
  /**
   * Helper flag that indicates that specific item is already being used in combination search
   * and shouldn't be used again (if `true`)
   *
   * @type {boolean}
   * @memberof TradeupItemWithFloat
   */
  usedInSearch?: boolean;
  constructor(init?: TradeupItemWithFloat) {
    if (init) {
      this.item = init.item;
      this.float = init.float;
    }
  }
}

export class TradeupCalculation {
  // tslint:disable-next-line:no-shadowed-variable
  total: number = 0;
  totalCost: number = 0;
  itemAmount: number = 0;
  cheapestOutcomeItem: Weapon;
  cheapestPrize = Number.MAX_VALUE;
  cheapestChance = 0;
  /**
   * Float of cheapest item
   *
   * @type {number}
   * @memberof TradeupCalculation
   */
  cheapestItemFloat: number = 0;
  mostExpensiveOutcomeItem: Weapon;
  mostExpensivePrize = 0;
  mostExpensiveChance = 0;
  /**
   * Float of most expensive item
   *
   * @type {number}
   * @memberof TradeupCalculation
   */
  mostExpensiveItemFloat: number = 0;
}

/**
 * Outcome summary
 *
 * @export
 * @class OutcomeSummary
 */
export class OutcomeSummary {
  /**
   * Outcome items
   *
   * @type {TradeupOutcome[]}
   * @memberof OutcomeSummary
   */
  outcomes: TradeupOutcome[];
  /**
   * Amount of outcome items that are below tradeup cost
   *
   * @type {number}
   * @memberof OutcomeSummary
   */
  outcomeItemCountBelowCost: number = 0;
  /**
   * Total odds of items that are below overal tradeup cost
   *
   * @type {number}
   * @memberof OutcomeSummary
   */
  oddsBelowCost: number = 0;
  /**
   * Opposite to odds below cost. Odds of outcome items which have price above tradeup cost
   *
   * @type {number}
   * @memberof OutcomeSummary
   */
  successOdds: number = 0;
  constructor(
    tradeupSummary: TradeupSummary,
    outcomes: TradeupOutcome[],
    statttrak: boolean,
    calculateWithoutTax?: boolean
  ) {
    // Storing outcomes and sorting them by odds desc (Highest odds will be first)
    this.outcomes = outcomes.sort((a, b) => b.odds - a.odds);
    // Resulting odds
    this.oddsBelowCost = 0;
    // Calculating odds and items that are below tradeup cost
    outcomes.forEach((outcome) => {
      let outcomePrice = getPrice(outcome.item, outcome.float, statttrak);
      if (!outcomePrice) {
        outcomePrice = 0;
      }
      // Deciding either we are setting outcome price for compare WITH or WITHOUT tax.
      // If "WITHOUT TAX" then outcome prices will be without tax and tradeup cost will be compared
      // to this price. Otherwise tradeup cost will be compared to SCM price
      const outcomePriceForCompare = calculateWithoutTax ? outcomePrice * 0.87 : outcomePrice;
      // If current outcome price is below tradeup cost then summing odds
      if (tradeupSummary.cost > outcomePriceForCompare) {
        this.oddsBelowCost += outcome.odds;
        // Summing amount of items that are below cost
        this.outcomeItemCountBelowCost++;
      }
    });

    // Calculating success odds (opposite to odds below cost)
    this.successOdds = 1 - this.oddsBelowCost;
  }
}

export class TradeupSummary {
  /**
   * Expected value of tradeup (Average value of all outcomes). By default is "0"
   *
   * @type {number}
   * @memberof TradeupSummary
   */
  expectedValue: number;
  /**
   * Tradeup cost. By default is large number for special cases
   *
   * @type {number}
   * @memberof TradeupSummary
   */
  cost: number = Number.MAX_SAFE_INTEGER;
  cheapestPrize: number;
  /**
   * Cheapest prize
   *
   * @type {Weapon}
   * @memberof TradeupSummary
   */
  cheapestPrizeItem: Weapon;
  /**
   * Float of cheapest outcome item
   *
   * @type {number}
   * @memberof TradeupSummary
   */
  cheapestFloat: number;
  mostExpensivePrize: number;
  cheapestOdds: number;
  mostExpensiveOdds: number;
  /**
   * Float of most expensive outcome item
   *
   * @type {number}
   * @memberof TradeupSummary
   */
  mostExpensiveFloat: number;
  mostExpensivePrizeItem: Weapon;
  profit: number;
  profitPercentage: number;
  profitPrizeWithoutSteamTAX: number;
  outcomeSummary: OutcomeSummary;
  averageFloat: number;
  constructor(tradeupCalculation?: TradeupCalculation, expectedValue?: number) {
    if (tradeupCalculation && expectedValue !== undefined) {
      this.expectedValue = expectedValue;
      this.cost = tradeupCalculation.totalCost;
      this.cheapestPrize = tradeupCalculation.cheapestPrize;
      this.cheapestFloat = tradeupCalculation.cheapestItemFloat;
      this.cheapestPrizeItem = tradeupCalculation.cheapestOutcomeItem;
      this.mostExpensivePrize = tradeupCalculation.mostExpensivePrize;
      this.cheapestOdds = tradeupCalculation.cheapestChance;
      this.mostExpensiveOdds = tradeupCalculation.mostExpensiveChance;
      this.mostExpensiveFloat = tradeupCalculation.mostExpensiveItemFloat;
      this.mostExpensivePrizeItem = tradeupCalculation.mostExpensiveOutcomeItem;
      this.profit = this.expectedValue - this.cost;
      this.profitPercentage = this.profit ? this.profit / this.cost : 0;
      // Calculating profit prize after steam TAX. Converting to number and leaving only 2 digits
      // TODO: Investigate. Looks like this is not needed because there are two cases:
      // * By default we are taking prices without steam tax and then calculating EV
      // * In other case we can take prices WITH steam tax to calculate EV
      // Based on the EV we are calculating profit and if we took prices without
      // steam tax then this is not needed probably because we didn't include tax
      this.profitPrizeWithoutSteamTAX = +(0.87 * this.profit).toFixed(2);
    }
  }
}

export class TradeupOutcome extends TradeupItemWithFloat {
  outputCount: number;
  /**
   * Odds aka chance of getting this item
   *
   * @type {number}
   * @memberof TradeupOutcome
   */
  odds: number;
}

export class BestTradeup {
  items: TradeupItemWithFloat[];
  tradeupSummary: TradeupSummary;
}

/**
 * Weapon rarity enum
 *
 * @export
 * @enum {number}
 */
export enum WeaponRarity {
  'Consumer' = 1,
  'Industrial',
  'MilSpec',
  'Restricted',
  'Classified',
  'Covert',
}

/**
 * Enum for tradeup filtering (sorting actually)
 *
 * @export
 * @enum {number}
 */
export enum TradeupFilterEnum {
  'ByCost' = 1,
  'ByEV',
  'ByProfitPercentage',
  'ByProfitValue',
  'BySuccessOdds',
  'ByMostExpensiveOutcome',
  'ByMostExpensiveOutcomeOdds',
  'ByLeastOutcomeItems',
  'ByLowestOutcomeItemAmount',
  'ByLowestLossOnWorstOutcome',
}

/**
 * Settings for tradeup search
 *
 * @export
 * @class TradeupSearchSettings
 */
export class TradeupSearchSettings {
  /**
   * Rarity of input items to search among.
   * By default `3` aka `Mil specs`
   *
   * @type {WeaponRarity}
   * @memberof TradeupSearchSettings
   */
  rarity: WeaponRarity = WeaponRarity.MilSpec;
  /**
   * Indicates if we are searching for stattrak tradeups.
   * By default `false`
   *
   * @type {boolean}
   * @memberof TradeupSearchSettings
   */
  stattrak: boolean = false;
  /**
   * Max cost of tradeup.
   * By default `100`
   *
   * @type {number}
   * @memberof TradeupSearchSettings
   */
  maxCost: number = 100;
  /**
   * Max tradeups to search and display.
   * By default `20`
   *
   * @type {number}
   * @memberof TradeupSearchSettings
   */
  maxTradeups: number = 20;
  /**
   * Flag indicates if tradeup cost should be compared to outcome item price that are without tax.
   * If `false` then tradeup cost will be compared to item price on SCM (with tax).
   * By default `true`
   *
   * @type {boolean}
   * @memberof TradeupSearchSettings
   */
  compareWithoutTax: boolean = true;
  /**
   * How difficult tradeup items should be to find. 0 - Hardest. 1 - Easiest.
   * This value is used when determining float of input item. For example, for FN item with difficulty `0.5`
   * float of input item with range 0 - 1 will 0.07 * 0.5 = **0.035**.
   * By default `0.5`
   *
   * @type {number}
   * @memberof TradeupSearchSettings
   */
  difficulty: number = 0.5;
  /**
   * Minimal volume. If 0 then will search for all items. Volume represents amount of sold
   * skin in last 24h. If its 0 then 0 skins were sold in last 24h.
   * By default `1`
   *
   * @type {number}
   * @memberof TradeupSearchSettings
   */
  minVolume: number = 1;
  /**
   * Minimal EV (in percents) that should be used to determin profitable trade ups.
   * Value should be whole number because later it will be divided by 100.
   * By default `4` (%)
   *
   * @type {number}
   * @memberof TradeupSearchSettings
   */
  minEVPercent: number = 4;
  /**
   * Minimal success for tradeup.
   * By default `0` (%)
   *
   * @type {number}
   * @memberof TradeupSearchSettings
   */
  minSuccess: number = 0;
  /**
   * Maximal success for tradeup.
   * By default `0` (%)
   *
   * @type {number}
   * @memberof TradeupSearchSettings
   */
  maxSuccess: number = 100;
  /**
   * Collections that should be included.
   * By default `[]` aka any
   *
   * @type {Collection[]}
   * @memberof TradeupSearchSettings
   */
  includedCollections: Collection[] = [];
  /**
   * Collections that should be excluded.
   * By default `[]` aka any
   *
   * @type {Collection[]}
   * @memberof TradeupSearchSettings
   */
  excludedCollections: Collection[] = [];
  /**
   * Primary collection. When it is set then search will be done primarly by this collection
   * and secondary collections are all others
   *
   * @type {Collection}
   * @memberof TradeupSearchSettings
   */
  primaryCollection: Collection;
  /**
   * Flag indicates if only one (single) collection should be used.
   * If `false` then search will be done with two collections
   *
   * @type {boolean}
   * @memberof TradeupSearchSettings
   */
  useSingleCollection?: boolean = false;
  /**
   * List with skins that are excluded from search.
   * By default empty array aka all skins included
   *
   * @type {string[]}
   * @memberof TradeupSearchSettings
   */
  excludedSkins?: string[] = [];
  /**
   * Inventory items (skins) that were selected to be used in search
   *
   * @type {InventoryItem[]}
   * @memberof TradeupSearchSettings
   */
  skinsFromInventory: InventoryItem[];
  /**
   * Indicates if only items from inventory should be used for searching combination. If `false` then
   * search will be done as usual but additionally will add selected items to the mix
   *
   * @type {boolean}
   * @memberof TradeupSearchSettings
   */
  onlyInventory: boolean;
}

/**
 * Options for item search
 *
 * @export
 * @class ItemSearchOptions
 */
export class ItemSearchOptions {
  /**
   * Rarity
   *
   * @type {number}
   * @memberof ItemSearchOptions
   */
  rarity: number;
  /**
   * Min skin sell volume.
   * By default `0`
   *
   * @type {number}
   * @memberof ItemSearchOptions
   */
  minVolume: number = 0;
  /**
   * Optional collections that have to be excluded from search
   *
   * @type {Collection[]}
   * @memberof ItemSearchOptions
   */
  excludeCollections?: Collection[];
  /**
   * Optional collections that must be included. Search will be done ONLY WITHIN THESE collections
   *
   * @type {Collection[]}
   * @memberof ItemSearchOptions
   */
  includeCollections?: Collection[];
  /**
   * List of skin names that have to be excluded from search.
   * By default empty list aka all skins included
   *
   * @type {string[]}
   * @memberof ItemSearchOptions
   */
  excludedSkins?: string[] = [];
}

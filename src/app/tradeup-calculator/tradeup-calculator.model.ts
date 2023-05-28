import { Weapon } from '@server/items';
import { CollectionSortingOption, SkinSortingOption, SortingOption } from '../base.model';
import { BestTradeup, CollectionItemWithInfo, TradeupSearchSettings } from '../tradeup-search/tradeup.model';

export class CalculatorCopiedValues {
  float: number = undefined;
  price: number = undefined;
}

export class CalculatorFormInputItem extends CalculatorCopiedValues {
  inputItem: Weapon;
}

/**
 * Input item in trade up calculator
 *
 * @export
 * @class CalculatorInputItem
 */
export class CalculatorInputItem {
  /**
   * Input item
   *
   * @type {Weapon}
   * @memberof CalculatorInputItem
   */
  inputItem: Weapon;
  /**
   * Input item float
   *
   * @type {number}
   * @memberof CalculatorInputItem
   */
  float: number;
  /**
   * Custom input item price
   *
   * @type {number}
   * @memberof CalculatorInputItem
   */
  price: number;
  /**
   * Float index. Used to get correct price based on float value
   *
   * @type {number}
   * @memberof CalculatorInputItem
   */
  floatIndex: number;
  /**
   * ID of item to indicate if current item was added from inventory
   *
   * @type {boolean}
   * @memberof CalculatorInputItem
   */
  inventoryItemId: string;
}

/**
 * Trade up calculator form
 *
 * @export
 * @class CalculatorForm
 */
export class CalculatorForm {
  /**
   * If calculation is done for stattrak weapon or normal
   *
   * @type {boolean}
   * @memberof CalculatorForm
   */
  stattrak: boolean;
  /**
   * Rarity value
   *
   * @type {number}
   * @memberof CalculatorForm
   */
  rarity: number;
  /**
   * Indicates if prices should be used with or without steam tax
   *
   * @type {boolean}
   * @memberof CalculatorForm
   */
  withoutSteamTax: boolean;
  /**
   * List with input items for calculation
   *
   * @type {CalculatorInputItem[]}
   * @memberof CalculatorForm
   */
  items: CalculatorInputItem[];
}

/**
 * Model for collection display with specific collection, its items and outcomes
 *
 * @export
 * @class CollectionWithSkinsAndOutcomes
 */
export class CollectionWithSkinsAndOutcomes {
  /**
   * Collection with items
   *
   * @type {CollectionItemWithInfo}
   * @memberof CollectionWithSkinsAndOutcomes
   */
  collection: CollectionItemWithInfo;
  /**
   * Current collection outcome items
   *
   * @type {Weapon[]}
   * @memberof CollectionWithSkinsAndOutcomes
   */
  outcomes: Weapon[];
}

/**
 * Model for passing found trade up to calculator
 *
 * @export
 * @class TradeupFromSearchForCalculation
 */
export class TradeupFromSearchForCalculation {
  /**
   * Found tradeup
   *
   * @type {BestTradeup}
   * @memberof TradeupFromSearchForCalculation
   */
  tradeup: BestTradeup;
  /**
   * Search settings
   *
   * @type {TradeupSearchSettings}
   * @memberof TradeupFromSearchForCalculation
   */
  settings: TradeupSearchSettings;
}

/**
 * Share information for calculator when sharing trade up via calculator
 *
 * @export
 * @class CalculatorShareInfo
 */
export class CalculatorShareInfo {
  /**
   * List with item IDs of input items
   *
   * @type {string[]}
   * @memberof TradeupShareInfo
   */
  itemIds: string[];
  /**
   * List of floats for input items
   *
   * @type {number[]}
   * @memberof TradeupShareInfo
   */
  floats: number[];
  /**
   * List with prices for input items
   *
   * @type {number[]}
   * @memberof CalculatorShareInfo
   */
  prices: number[];
  /**
   * Date when trade up was shared
   *
   * @type {Date}
   * @memberof CalculatorShareInfo
   */
  shared: Date;
}

/**
 * Sorting options for calculator
 *
 * @export
 * @class CalculatorSortingOption
 */
export class CalculatorSortingOption {
  /**
   * Sorting options for skins
   *
   * @type {SortingOption<SkinSortingOption>}
   * @memberof CalculatorSortingOption
   */
  skins: SortingOption<SkinSortingOption> = new SortingOption();
  /**
   * Sorting options for inventory skins
   *
   * @type {SortingOption<SkinSortingOption>}
   * @memberof CalculatorSortingOption
   */
  inventory: SortingOption<SkinSortingOption> = new SortingOption();
  /**
   * Sorting options for collections
   *
   * @type {SortingOption<CollectionSortingOption>}
   * @memberof CalculatorSortingOption
   */
  collections: SortingOption<CollectionSortingOption> = new SortingOption();
}

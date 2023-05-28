import { Collection, Weapon } from '@server/items';
import { BaseEntity } from '../base.model';
import { getCollection, getRarityName } from '../tradeup-search/tradeup-shared-utils';
import { TradeupSummary } from '../tradeup-search/tradeup.model';

/**
 * Overall tradeup summary
 *
 * @export
 * @class TradeupOverallSummary
 */
export class TradeupOverallSummary {
  /**
   * Total tradeup results (Tradeups done). Counts only tradeups with outcome
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  total: number = 0;
  /**
   * Amount of money that was spent in total
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  totalSpent: number = 0;
  /**
   * Amount of money that was received in total
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  totalReceived: number = 0;
  /**
   * Overall profit (`Total received - Total spent`)
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  profit: number = 0;
  /**
   * Amount of stattrak tradeups done
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  stattrakTradeupAmount: number = 0;
  /**
   * Percentage of stattrak tradeup amount comparing to total amount of tradeups
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  stattrakTradeupAmountPercentage: number = 0;
  /**
   * Average tradeup cost
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  averageCost: number = 0;
  /**
   * Average tradeup return (profit)
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  averageProfit: number = 0;
  /**
   * Name of best outcome by profit
   *
   * @type {string}
   * @memberof TradeupOverallSummary
   */
  bestOutcomeName: string = '';
  /**
   * Indicates if best outcome was stattrak or not
   *
   * @type {boolean}
   * @memberof TradeupOverallSummary
   */
  bestOutcomeStattrak: boolean;
  /**
   * Largest profit received
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  mostProfit: number = 0;
  /**
   * Largest amount of money lost on tradeup
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  mostLoss: number = 0;
  /**
   * Number of successful tradeups (With profit > 0)
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  successfulTradeupAmount: number = 0;
  /**
   * Percentage of successful tradeup amount comparing to total amount of tradeups
   *
   * @type {number}
   * @memberof TradeupOverallSummary
   */
  successfulTradeupAmountPercentage: number = 0;
}

/**
 * Interface for tradeup input item
 *
 * @export
 * @interface ITradeupInput
 */
export interface ITradeupInput {
  name: string;
  float: number;
  price: number;
}

/**
 * Model for tradeup input item
 *
 * @export
 * @class TradeupInputItem
 */
export class TradeupInputItem {
  name: string;
  float: number = 0;
  price: number = 0;
  constructor(initValues?: ITradeupInput) {
    // If we have initial values then assigning them
    if (initValues) {
      Object.assign(this, initValues);
    }
  }
}

/**
 * Model of outcome in tradeup result
 *
 * @export
 * @class TradeupResultOutcome
 */
export class TradeupResultOutcome {
  name: string;
  image: string;
  collection: Collection;
  rarity: number;
  rarityName: string;
  constructor(skin: Weapon, allCollections: Collection[]) {
    this.name = skin.name;
    this.image = skin.image;
    this.rarity = skin.rarity.value;
    this.rarityName = getRarityName(skin.rarity.value);
    this.collection = getCollection(skin.collection.key, allCollections);
  }
}

/**
 * Tradeup result summary
 *
 * @export
 * @class TradeupResultSummary
 */
export class TradeupResultSummary {
  /**
   * Total input cost
   *
   * @type {number}
   * @memberof TradeupResultSummary
   */
  cost: number = 0;
  /**
   * Calculated profit based on formula: `Received - Cost`
   *
   * @type {number}
   * @memberof TradeupResultSummary
   */
  profit: number = 0;
  /**
   * Average input float
   *
   * @type {number}
   * @memberof TradeupResultSummary
   */
  averageInputFloat: number = 0;
  constructor(result?: TradeupResult, currentCost: number = 0) {
    if (result) {
      let itemsWithFloat = 0;
      for (const input of result.inputItems) {
        this.cost += input.price ?? 0;
        this.averageInputFloat += input.float ?? 0;
        // Calculating amount of items with float to get accurate
        // average float value
        if (input.float) {
          itemsWithFloat++;
        }
      }
      // Calculating correct average input float
      this.averageInputFloat = this.averageInputFloat / itemsWithFloat;
      // Calculating profit. Either taking currently calculated cost
      // or if it is 0 then taking provided current cost. In one case
      // provided current cost can be "0" (when initializing result for editing)
      // but in other cases it will be provided
      this.profit = (result.received ?? 0) - (this.cost ?? currentCost);
    }
  }
}

/**
 * Tradeup result
 *
 * @export
 * @class TradeupResult
 */
export class TradeupResult extends BaseEntity {
  /**
   * Custom name for tradeup
   *
   * @type {string}
   * @memberof TradeupResult
   */
  tradeupName: string;
  inputItems: TradeupInputItem[];
  outcome: TradeupResultOutcome;
  outcomeFloat: number;
  stattrak: boolean;
  /**
   * Result summary
   *
   * @type {TradeupResultSummary}
   * @memberof TradeupResult
   */
  summary: TradeupResultSummary;
  /**
   * Tradup as a whole summary
   *
   * @type {TradeupSummary}
   * @memberof TradeupResult
   */
  calculatedSummary: TradeupSummary;
  /**
   * Amount of money received after selling
   *
   * @type {number}
   * @memberof TradeupResult
   */
  received: number;
  /**
   * Date when tradeup was completed (when tradeup was saved with Outcome item)
   *
   * @type {Date}
   * @memberof TradeupResult
   */
  completed: Date;
  /**
   * Visual indicator of what float user should be trying to keep (below this value)
   *
   * @type {number}
   * @memberof TradeupResult
   */
  floatRequired: number;
  constructor() {
    super();
  }
}

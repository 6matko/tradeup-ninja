import { Weapon } from '@server/items';

/**
 * Dictionary of sorted inputs
 *
 * @export
 * @class SortedInputDictionary
 */
export class SortedInputDictionary {
  [rarity: number]: Weapon[];
}

/**
 * Model for conditions that are displayed in price table
 *
 * @export
 * @class ConditionForPriceDisplay
 */
export class ConditionForPriceDisplay {
  /**
   * Condition name
   *
   * @type {string}
   * @memberof ConditionForPriceDisplay
   */
  condition: string;
  /**
   * Float for getting price (Could be any in condition diapazone)
   *
   * @type {number}
   * @memberof ConditionForPriceDisplay
   */
  float: number;
  constructor(condition: string, float: number) {
    this.condition = condition;
    this.float = float;
  }
}

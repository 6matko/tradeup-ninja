import { TradeupItemWithFloat } from '../tradeup.model';

/**
 * Model for input items that are distinct with amount
 *
 * @export
 * @class InputItemsForDisplay
 * @extends {TradeupItemWithFloat}
 */
export class InputItemsForDisplay extends TradeupItemWithFloat {
    /**
     * Amount of repeating input item
     *
     * @type {number}
     * @memberof InputItemsForDisplay
     */
    amount: number;
}

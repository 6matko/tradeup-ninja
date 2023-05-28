/**
 * Information about tradeup sharing (information to recreate tradeup)
 *
 * @export
 * @class TradeupShareInfo
 */
export class TradeupShareInfo {
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
     * Indicates if its a stattrak tradeup
     *
     * @type {boolean}
     * @memberof TradeupShareInfo
     */
    stattrak: boolean;
    /**
     * Indicates if prices should be compared without steam tax
     *
     * @type {boolean}
     * @memberof TradeupShareInfo
     */
    noTax: boolean;
    /**
     * Date when tradeup was shared
     *
     * @type {Date}
     * @memberof TradeupShareInfo
     */
    shared: Date;
}

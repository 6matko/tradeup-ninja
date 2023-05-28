/**
 * Date range for date picker
 *
 * @export
 * @class DateRange
 */
export class DateRange {
    /**
     * Starting date
     *
     * @type {Date}
     * @memberof DateRange
     */
    start: Date;
    /**
     * End date
     *
     * @type {Date}
     * @memberof DateRange
     */
    end: Date;
}

/**
 * Model for tradeup result filtering
 *
 * @export
 * @class ResultFilter
 */
export class ResultFilter {
    /**
     * Date range of completed tradeups. Starting date (from) and end date (to)
     *
     * @type {DateRange}
     * @memberof ResultFilter
     */
    completedRange: DateRange;
    /**
     * Indicates if stattrak tradeups should be shown
     *
     * @type {boolean}
     * @memberof ResultFilter
     */
    stattrak: boolean = true;
    /**
     * Indicates if normal tradeups (non stattrak) should be shown
     *
     * @type {boolean}
     * @memberof ResultFilter
     */
    normal: boolean = true;
    /**
     * Indicates if completed tradeups should be shown
     *
     * @type {boolean}
     * @memberof ResultFilter
     */
    completed: boolean = true;
    /**
     * Indicates if incomplete tradeups should be shown
     *
     * @type {boolean}
     * @memberof ResultFilter
     */
    incomplete: boolean = true;
    /**
     * List with rarities (input item rarities) that should be shown. For example if mil-spec and classified
     * tradeups should be shown this list should contain appropriate rarity values
     *
     * @type {number[]}
     * @memberof ResultFilter
     */
    rarities: number[];
    /**
     * Indicates if successful tradeups should be shown (With positive profit)
     *
     * @type {boolean}
     * @memberof ResultFilter
     */
    successful: boolean = true;
    /**
     * Indicates if failed tradeups should be shown (With negative profit)
     *
     * @type {boolean}
     * @memberof ResultFilter
     */
    failed: boolean = true;
    /**
     * Text by which filtering should be done (tradeup title, outcome collection name or outcome skin name)
     *
     * @type {string}
     * @memberof ResultFilter
     */
    filterText: string;
}

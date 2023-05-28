/**
 * Min - max floats for range
 *
 * @export
 * @class MinMaxFloats
 */
export class MinMaxFloats {
    /**
     * Min or starting range value
     *
     * @type {number}
     * @memberof MinMaxFloats
     */
    min: number;
    /**
     * Max or ending range value
     *
     * @type {number}
     * @memberof MinMaxFloats
     */
    max: number;
    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }
}

/**
 * Default float ranges for each condition starting with Factory New (0)
 */
export const FloatRange = [
    new MinMaxFloats(0, 0.07),
    new MinMaxFloats(0.07, 0.15),
    new MinMaxFloats(0.15, 0.38),
    new MinMaxFloats(0.38, 0.45),
    new MinMaxFloats(0.45, 1)
];

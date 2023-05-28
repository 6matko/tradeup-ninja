import { TradeupOutcome } from '../../tradeup-search/tradeup.model';

/**
 * Simulation stats and useful info
 *
 * @export
 * @class SimulationStats
 */
export class SimulationStats {
    /**
     * Longest lose streak
     *
     * @type {number}
     * @memberof SimulationStats
     */
    longestLoseStreak: number = 0;
    /**
     * Longest win streak
     *
     * @type {number}
     * @memberof SimulationStats
     */
    longestWinStreak: number = 0;
    /**
     * Number of tradeup attempts before user has made profit
     *
     * @type {number}
     * @memberof SimulationStats
     */
    attemptsBeforeMakingProfit: number = 0;
    /**
     * Amount of money spent 
     *
     * @type {number}
     * @memberof SimulationStats
     */
    totalSpent: number = 0;
    /**
     * Amount of money received after paying tax
     *
     * @type {number}
     * @memberof SimulationStats
     */
    totalReceived: number = 0;
    /**
     * Best possible outcome
     *
     * @type {TradeupOutcome}
     * @memberof SimulationStats
     */
    bestOutcome: TradeupOutcome;
    /**
     * How many times best possible outcome was hit (received)
     *
     * @type {number}
     * @memberof SimulationStats
     */
    bestOutcomeHitAmount: number = 0;
    /**
     * Worst possible outcome
     *
     * @type {TradeupOutcome}
     * @memberof SimulationStats
     */
    worstOutcome: TradeupOutcome;
    /**
     * How many times worst possible outcome was hit (received)
     *
     * @type {number}
     * @memberof SimulationStats
     */
    worstOutcomeHitAmount: number = 0;
    /**
     * Frequency stats for each individual outcome
     *
     * @type {OutcomeFrequency[]}
     * @memberof SimulationStats
     */
    outcomeFrequency: OutcomeFrequency[] = [];
    /**
     * Highest amount of money user has lost in tradeup simulation (Lowest point)
     *
     * @type {number}
     * @memberof SimulationStats
     */
    highestLoss: number = 0;
    /**
     * Highest amount of money user received from tradeup simulation (Highest point)
     *
     * @type {number}
     * @memberof SimulationStats
     */
    highestGain: number = 0;
}

export class OutcomeFrequency extends TradeupOutcome {
    /**
     * Frequency count how many times this item was hit (received)
     *
     * @type {number}
     * @memberof OutcomeFrequency
     */
    count: number;
}

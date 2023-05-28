import { TradeupOutcome } from '../tradeup-search/tradeup.model';

/**
 * Model for simulation data (for subject)
 *
 * @export
 * @class SimulationData
 */
export class SimulationData {
    /**
     * Possiblle outcomes
     *
     * @type {TradeupOutcome[]}
     * @memberof SimulationData
     */
    outcomes: TradeupOutcome[];
    /**
     * Tradeup cost
     *
     * @type {number}
     * @memberof SimulationData
     */
    cost: number;
    /**
     * Indicates if skin has stattrak
     *
     * @type {boolean}
     * @memberof SimulationData
     */
    stattrak: boolean;
}

export class SimulationSummary {
    /**
     * Overall profit after simulation (Total received - total spent)
     *
     * @type {number}
     * @memberof SimulationSummary
     */
    totalProfit: number = 0;
    /**
     * Amount of money user totally spent during simulation
     *
     * @type {number}
     * @memberof SimulationSummary
     */
    totalSpent: number = 0;
    /**
     * Amount of money user would receive if sold item (Without tax)
     *
     * @type {number}
     * @memberof SimulationSummary
     */
    totalReceived: number = 0;
    /**
     * Amount of outcomes above cost (successful)
     *
     * @type {number}
     * @memberof SimulationSummary
     */
    successfulOutcomes: number = 0;
    /**
     * Amount of successful tradeup outcomes (prize is above cost). Value in percentages
     *
     * @type {number}
     * @memberof SimulationSummary
     */
    successRate: number = 0;
    constructor() { }
}

/**
 * Model that is sent to Web Worker when initialziing simulation
 *
 * @export
 * @class SimulationWorkerData
 */
export class SimulationWorkerData {
    /**
     * Command (start/stop)
     *
     * @type {('start' | 'stop')}
     * @memberof SimulationWorkerData
     */
    cmd: 'start' | 'stop';
    /**
     * Simulation settings
     *
     * @type {SimulationSettings}
     * @memberof SimulationWorkerData
     */
    settings: SimulationSettings;
}

/**
 * Simulation settings
 *
 * @export
 * @class SimulationSettings
 */
export class SimulationSettings {
    /**
     * Simulation count
     *
     * @type {number}
     * @memberof SimulationSettings
     */
    count: number;
    /**
     * Outcomes for simulation
     *
     * @type {TradeupOutcome[]}
     * @memberof SimulationSettings
     */
    outcomes: TradeupOutcome[];
    /**
     * Indicates if tradeup is for StatTrak
     *
     * @type {boolean}
     * @memberof SimulationSettings
     */
    stattrak: boolean;
    /**
     * Tradeup cost
     *
     * @type {number}
     * @memberof SimulationSettings
     */
    cost: number;
}

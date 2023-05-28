/// <reference lib="webworker" />

import { getPrice, msToMinutesSeconds, weightedRandom } from '../tradeup-search/tradeup-shared-utils';
import { TradeupOutcome, WorkerResponse } from '../tradeup-search/tradeup.model';
import { SimulationSettings, SimulationSummary, SimulationWorkerData } from './tradeup-simulation.model';

let settings: SimulationSettings;
const simulationSummary: SimulationSummary = new SimulationSummary();

addEventListener('message', (evt) => {
    // Init
    const data = evt.data as SimulationWorkerData;
    // Saving settings
    settings = data.settings;

    switch (data.cmd) {
        case 'stop':
            const workerResponse = new WorkerResponse<unknown>({
                msg: '<div class="text-danger">Worker stopped</div>',
                isHTML: true
            });
            postMessage(workerResponse, undefined);
            // Terminating worker
            self.close();
            break;
        case 'start':
            const startTime = performance.now();
            // List with simulated outcomes
            let simulatedOutcomes;
            // Creating profitability object to use it in weighted random method
            const probability = {};
            settings.outcomes.forEach((outcome, i) => {
                probability[i] = outcome.odds;
            });

            // Creating new list with simulated items to avoid references. Doing it because
            // otherwise change detection doesn't know its new list
            const simulatedItems = [];
            // Simulating tradeups
            for (let i = 0; i < settings.count; i++) {
                // Getting random index for outcome
                const outcomeIndex = weightedRandom(probability) as number;
                // Storing random outcome for quick access
                const outcome = settings.outcomes[outcomeIndex];
                // Adding simulation result to all simulated result list
                simulatedItems.push(outcome);
                // Performing basic calculations based on each individual outcome
                calculateBasicSummary(outcome);
            }

            // Creating new array of simulated outcomes for change detection to work
            simulatedOutcomes = [...simulatedItems];

            // Calculating final summary of simulation
            calculateFinalSummary();

            const endTime = performance.now();

            const responseDTO: WorkerResponse<any> = {
                msg: `${msToMinutesSeconds(endTime - startTime)} seconds`,
                isHTML: false,
                data: { simulationSummary, simulatedOutcomes },
                sticky: true,
                completed: true,
            };

            postMessage(responseDTO, undefined);

            // Terminates the worker
            self.close();
            break;
        default:
            postMessage('Unknown cmd', undefined);
    }
});


/**
 * Method calculates basic summary
 *
 * @param {TradeupOutcome} outcome Outcome item
 */
function calculateBasicSummary(outcome: TradeupOutcome) {
    // Getting outcome prize (money) after selling it (without tax)
    const outcomePrize = getPrice(outcome.item, outcome.float, settings.stattrak, true);

    // If outcome prize is more (or at least equal) than tradeup cost then marking +1 on succesfful outcomes
    if (outcomePrize >= settings.cost) {
        simulationSummary.successfulOutcomes++;
    }

    // Summing amount of spent money based on tradeup cost
    simulationSummary.totalSpent += settings.cost;
    // Summing amount of received money 
    simulationSummary.totalReceived += outcomePrize;
}

/**
 * Method calculates final summary
 *
 */
function calculateFinalSummary() {
    // Calculating total profit
    simulationSummary.totalProfit = simulationSummary.totalReceived - simulationSummary.totalSpent;
    // Calculating success rate
    simulationSummary.successRate = simulationSummary.successfulOutcomes / settings.count;
}

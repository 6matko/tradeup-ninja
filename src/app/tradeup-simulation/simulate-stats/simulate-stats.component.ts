import { Component, Input, OnChanges } from '@angular/core';
import { PriceFromFloatPipe } from '../../pipes/price-from-float/price-from-float.pipe';
import { TradeupOutcome } from '../../tradeup-search/tradeup.model';
import { OutcomeFrequency, SimulationStats } from './simulate-stats.model';

@Component({
  selector: 'app-simulate-stats',
  templateUrl: './simulate-stats.component.html',
  styleUrls: ['./simulate-stats.component.scss'],
  providers: [PriceFromFloatPipe],
})
export class SimulateStatsComponent implements OnChanges {
  /**
   * List with all possible outcomes
   *
   * @type {TradeupOutcome[]}
   * @memberof SimulateStatsComponent
   */
  @Input() allOutcomes: TradeupOutcome[];
  /**
   * Simulated outcomes
   *
   * @type {TradeupOutcome[]}
   * @memberof SimulateStatsComponent
   */
  @Input() simulatedOutcomes: TradeupOutcome[];
  /**
   * Tradeup cost
   *
   * @type {number}
   * @memberof SimulateStatsComponent
   */
  @Input() cost: number;
  /**
   * Indicator if its a StatTrak tradeup
   *
   * @type {boolean}
   * @memberof SimulateStatsComponent
   */
  @Input() stattrak: boolean;
  /**
   * Resulting stats about simulation
   *
   * @type {SimulationStats}
   * @memberof SimulateStatsComponent
   */
  stats: SimulationStats = new SimulationStats();
  constructor(
    private priceFromFloat: PriceFromFloatPipe,
  ) { }

  ngOnChanges() {
    this.calculateStats();
  }

  /**
   * Method calculates all the statistical information
   *
   * @private
   * @memberof SimulateStatsComponent
   */
  private calculateStats() {
    // Initializing new stats data because we will fill it with new/latest info
    this.stats = new SimulationStats();

    // Setting current win/lose streaks as a counter
    let currentWinStreak = 0;
    let currentLoseStreak = 0;

    // Sorting outcome by prize in order to get best and worst outcome
    const sortedOutcomesByPrize = this.sortOutcomesByPrize();
    // Getting best outcome (since its sorted by prize Desc then its first)
    this.stats.bestOutcome = sortedOutcomesByPrize[0];
    // Getting worst outcome (since its sorted by prize Desc then its last)
    this.stats.worstOutcome = sortedOutcomesByPrize[sortedOutcomesByPrize.length - 1];

    // Calculating outcome item frequency
    this.setOutcomeFrequency();

    // Walking through each outcome to gather stats
    this.simulatedOutcomes.forEach((outcome, index) => {
      // Getting outcome price after tax
      const outcomePrize: number = this.priceFromFloat.transform(outcome.item, outcome.float, true, this.stattrak);
      // Calculating profit
      const profit = outcomePrize - this.cost;
      // Calculating total money spent
      this.stats.totalSpent += this.cost;
      // Calculating total money received after tax
      this.stats.totalReceived += outcomePrize;

      // Calculating total profit
      const totalProfit = this.stats.totalReceived - this.stats.totalSpent;
      // If total profit is positive then setting amount of attempts that were made before getting that profit
      if (totalProfit > 0) {
        this.setAttemptsBeforeMakingProfit(index);
      }

      // Calculating highest profit (gain) and loss
      this.stats.highestGain = this.stats.highestGain < totalProfit ? totalProfit : this.stats.highestGain;
      this.stats.highestLoss = this.stats.highestLoss > totalProfit ? totalProfit : this.stats.highestLoss;

      // Calculating current win/lose streak
      if (profit > 0) {
        // Increasing win streak
        currentWinStreak++;
        // Resetting lose streak
        currentLoseStreak = 0;
      } else {
        currentLoseStreak++;
        currentWinStreak = 0;
      }
      // After calculation is done setting new values for stats
      this.setBestWinLossStreak(currentWinStreak, currentLoseStreak);
      // Setting amount of best/worst outcome hit based on current outcome
      this.setBestWorstOutcomeHitAmount(outcome);
    });
  }

  /**
   * Method counts each outcome frequency and stores that information for stats
   *
   * @private
   * @memberof SimulateStatsComponent
   */
  private setOutcomeFrequency() {
    // Resulting list with outcome frequency
    const outcomeFrequency: OutcomeFrequency[] = [];
    // Walking through all possible outcomes to count frequency of each individual outcome
    this.allOutcomes.forEach(outcome => {
      // Creeating current outcome frequency where we copy information about current outcome
      const currOutcomeFrequency: OutcomeFrequency = {
        ...outcome,
        // Counting amount of same outcomes in simulation
        count: this.simulatedOutcomes.filter(simOutcome => simOutcome.item.name === outcome.item.name).length,
      };
      // Adding information about current frequncy to all frequency list
      outcomeFrequency.push(currOutcomeFrequency);
    });
    // Setting outcome frequncy on stats
    this.stats.outcomeFrequency = outcomeFrequency;
  }

  /**
   * Method sets amount of best/worst outcome hit amount
   *
   * @private
   * @param {TradeupOutcome} currOutcome Current outcome
   * @memberof SimulateStatsComponent
   */
  private setBestWorstOutcomeHitAmount(currOutcome: TradeupOutcome) {
    // Increasing amount of best outcome hit
    if (this.stats.bestOutcome.item.name === currOutcome.item.name) {
      this.stats.bestOutcomeHitAmount++;
    }
    // Increasing amount of worst outcome hit
    if (this.stats.worstOutcome.item.name === currOutcome.item.name) {
      this.stats.worstOutcomeHitAmount++;
    }
  }

  /**
   * Method sets best win or loss streak values for stats
   *
   * @private
   * @param {number} winStreak Current win streak
   * @param {number} loseStreak Current lose streak
   * @memberof SimulateStatsComponent
   */
  private setBestWinLossStreak(winStreak: number, loseStreak: number) {
    // If longest win streak in stats is less than current win streak then updating it
    // with new one
    if (this.stats.longestWinStreak < winStreak) {
      this.stats.longestWinStreak = winStreak;
    }
    // If longest lose streak in stats is less than current lose streak then updating it
    // with new one
    if (this.stats.longestLoseStreak < loseStreak) {
      this.stats.longestLoseStreak = loseStreak;
    }
  }

  /**
   * Method sets amount of attempts user made before making profit
   *
   * @private
   * @param {number} index Outcome index
   * @memberof SimulateStatsComponent
   */
  private setAttemptsBeforeMakingProfit(index: number) {
    if (!index || !this.stats.attemptsBeforeMakingProfit) {
      this.stats.attemptsBeforeMakingProfit = index + 1;
    }
  }

  /**
   * Method sorts outcomes by prize
   *
   * @private
   * @param {boolean} [asc=false] Ascending or descending. By default `false` (Descending)
   * @returns {TradeupOutcome[]} Returns outcome list sorted by prize
   * @memberof SimulateStatsComponent
   */
  private sortOutcomesByPrize(asc: boolean = false): TradeupOutcome[] {
    // Creating new array of all outcomes to avoid referencing sorting. We don't need
    // all outcome array to be sorted
    const outcomesByPrize = [...this.allOutcomes].sort((a, b) => {
      // Not using "without tax" because we don't care about them. All we need is to know the most expensive
      // outcome and therefore not performing extra operations
      const firstPrize = this.priceFromFloat.transform(a.item, a.float, false, this.stattrak);
      const secondPrize = this.priceFromFloat.transform(b.item, b.float, false, this.stattrak);
      // Sorting outcomes ascending or desending order
      return asc ? firstPrize - secondPrize : secondPrize - firstPrize;
    });
    return outcomesByPrize;
  }
}

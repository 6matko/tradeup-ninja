import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StructuredCollectionWithItems } from '../tradeup-search/tradeup.model';
import { SimulationData } from './tradeup-simulation.model';

@Injectable({
  providedIn: 'root',
})
export class TradeupSimulationService {
  private structCollections: StructuredCollectionWithItems[] = [];
  /**
   * Behavior subject that notifies about simulation menu. Either it should be opened or closed
   *
   * @private
   * @type {BehaviorSubject<TradeupOutcome[]>}
   * @memberof TradeupSimulationService
   */
  private simulationSubject: BehaviorSubject<SimulationData> = new BehaviorSubject(undefined);
  constructor() {}

  /**
   * Method emits event to hide simulation menu
   *
   * @memberof TradeupSimulationService
   */
  closeSimulation() {
    // Sending undefined aka falsy value to hide simulation menu
    this.simulationSubject.next(undefined);
  }

  /**
   * Method that returns Obseravble with simulation status (outcomes)
   *
   * @returns Returns `Observable` with outcomes or falsy value if menu should be hidden
   * @memberof TradeupSimulationService
   */
  getSimulationStatus() {
    return this.simulationSubject.asObservable();
  }

  simulateTradeupByOutcomes(simData: SimulationData) {
    this.simulationSubject.next(simData);
  }
}

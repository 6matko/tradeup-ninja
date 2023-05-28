import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RootObject } from '@server/items';
import { SimulationData } from '../../tradeup-simulation/tradeup-simulation.model';
import { TradeupSimulationService } from '../../tradeup-simulation/tradeup-simulation.service';
import { BestTradeup } from '../tradeup.model';
import { TradeupShareInfo } from './tradeup-share-display.model';

@Component({
  selector: 'app-tradeup-share-display',
  templateUrl: './tradeup-share-display.component.html',
  styleUrls: ['./tradeup-share-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupShareDisplayComponent implements OnInit {
  /**
   * Tradeup that should be displayed
   *
   * @type {BestTradeup}
   * @memberof TradeupShareDisplayComponent
   */
  tradeup: BestTradeup;
  /**
   * Stored items for caching
   *
   * @type {RootObject}
   * @memberof TradeupShareDisplayComponent
   */
  storedItems: RootObject;
  /**
   * Stored information about tradeup that is recreated
   *
   * @type {TradeupShareInfo}
   * @memberof TradeupShareDisplayComponent
   */
  tradeupInfo: TradeupShareInfo;
  /**
   * Tradeup name for display
   *
   * @type {string}
   * @memberof TradeupShareDisplayComponent
   */
  tradeupName: string;
  /**
   * Flag indicates if something is being loaded
   *
   * @type {boolean}
   * @memberof TradeupShareDisplayComponent
   */
  isLoading: boolean = true;
  /**
   * Error message if something went wrong
   *
   * @type {string}
   * @memberof TradeupShareDisplayComponent
   */
  error: string = '';
  constructor(
    private tradeupSimulationService: TradeupSimulationService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Storing data from resolver (quick access)
    const tradeupInfoFromResolver = this.route.snapshot.data.tradeupInfo;
    // If we got an error then displaying it
    if (tradeupInfoFromResolver.error) {
      this.error = tradeupInfoFromResolver.error;
    } else {
      // Storing data from resolver for display
      this.tradeupName = tradeupInfoFromResolver.tradeupName;
      this.tradeup = tradeupInfoFromResolver.tradeup;
      this.tradeupInfo = tradeupInfoFromResolver.tradeupInfo;
    }
    // Disabling loading indicator when
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  /**
   * Method sends signal to start tradeup simulation
   *
   * @param {SimulationData} simData Simulation data
   * @memberof TradeupShareDisplayComponent
   */
  simulateTradeup(simData: SimulationData) {
    this.tradeupSimulationService.simulateTradeupByOutcomes(simData);
  }
}

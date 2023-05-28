import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SYSTEM_CONST } from '../app.const';
import { ISystemConst } from '../base.model';
import { SimulationData } from '../tradeup-simulation/tradeup-simulation.model';
import { TradeupSimulationService } from '../tradeup-simulation/tradeup-simulation.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit, OnDestroy {
  /**
   * Flag indicates if tradeup simulation component is visible
   *
   * @type {boolean}
   * @memberof ShellComponent
   */
  simulationIsVisible: boolean;
  /**
   * Simulation related information
   *
   * @type {SimulationData}
   * @memberof ShellComponent
   */
  simulationData: SimulationData;
  /**
   * Flag indicates if sidebar is open
   *
   * @type {boolean}
   * @memberof ShellComponent
   */
  sidebarOpen: boolean;
  /**
   * Subscription that watches for simulation outcomes. If falsy then simulation menu should be closed
   *
   * @private
   * @type {Subscription}
   * @memberof ShellComponent
   */
  private simulationOutcomeeSubscription: Subscription = Subscription.EMPTY;
  constructor(
    private tradeupSimulationService: TradeupSimulationService,
    @Inject(SYSTEM_CONST) public systemConst: ISystemConst
  ) {}

  ngOnInit() {
    // Subscribing to simulation outcomes and based on outcomes that we receive we set if
    // simulation menu should be visible or not. If value is falsy then menu should be hidden
    this.tradeupSimulationService.getSimulationStatus().subscribe((simData) => {
      this.simulationIsVisible = !!simData;
      // If simulation should be visible then we have outcomes to work with
      if (this.simulationIsVisible) {
        // Storing simulation data for further usage
        this.simulationData = simData;
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.simulationOutcomeeSubscription.unsubscribe();
  }
}

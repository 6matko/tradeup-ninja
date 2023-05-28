import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { FloatToConditionModule } from '../pipes/float-to-condition.module';
import { PriceFromFloatModule } from '../pipes/price-from-float/price-from-float.module';
import { SimulateGraphComponent } from './simulate-graph/simulate-graph.component';
import { SimulateItemsComponent } from './simulate-items/simulate-items.component';
import { SimulateStatsComponent } from './simulate-stats/simulate-stats.component';
import { TradeupSimulationComponent } from './tradeup-simulation.component';
import { TradeupSimulationService } from './tradeup-simulation.service';

@NgModule({
  imports: [
    CommonModule,
    PriceFromFloatModule,
    FloatToConditionModule,
    ReactiveFormsModule,
    ChartsModule,
  ],
  declarations: [
    TradeupSimulationComponent,
    SimulateItemsComponent,
    SimulateGraphComponent,
    SimulateStatsComponent,
  ],
  providers: [
    TradeupSimulationService,
  ],
  exports: [
    TradeupSimulationComponent,
  ]
})
export class TradeupSimulationModule { }

import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { PriceFromFloatPipe } from '../../pipes/price-from-float/price-from-float.pipe';
import { UserPreferencesLoaderService } from '../../user-preferences/user-preferences-loader.service';
import { UserPreferences } from '../../user-preferences/user-preferences.model';
import { TradeupResult } from '../tradeup-result.model';

@Component({
  selector: 'app-tradeup-result-chart',
  templateUrl: './tradeup-result-chart.component.html',
  styleUrls: ['./tradeup-result-chart.component.scss'],
  providers: [PriceFromFloatPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeupResultChartComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * List with all tradeups
   *
   * @type {TradeupResult[]}
   * @memberof TradeupResultChartComponent
   */
  @Input() results: TradeupResult[] = [];
  /**
   * Chart data
   *
   * @type {ChartDataSets[]}
   * @memberof TradeupResultChartComponent
   */
  public lineChartData: ChartDataSets[] = [];
  /**
   * Chart labels
   *
   * @type {Label[]}
   * @memberof TradeupResultChartComponent
   */
  public lineChartLabels: Label[] = [];
  /**
   * Chart options
   *
   * @type {ChartOptions}
   * @memberof TradeupResultChartComponent
   */
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(130,139,143,0.05)'
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
          fontColor: 'rgba(130,139,143,1)',
        }
      }],
      yAxes: [{
        gridLines: {
          zeroLineColor: 'rgba(130,139,143,0.4)',
          color: 'rgba(130,139,143,0.05)'
        },
        ticks: {
          beginAtZero: true,
          fontColor: 'rgba(130,139,143,1)',
        }
      }]
    },
    title: {
      display: true,
      text: `Profit change`
    },
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => {
          // Storing for quick access
          const result = this.results.filter(res => res.outcome)[tooltipItem[0].index];
          // Displaying actual label (#4 for example), outcome name and how much money we received
          return `${tooltipItem[0].xLabel} ${result.stattrak ? 'StatTrak™' : ''} ${result.outcome.name} (Received: ${this.userPreferences.displayCurrency}${this.decimalPipe.transform(result.received, '1.2-2')})`;
        },
        label: (tooltipItem, data) => {
          // Storing for quick access
          const currOutcome = this.results[tooltipItem.index];
          // Displaying tradeup cost and profit (Received - Cost)
          return `Cost: ${this.userPreferences.displayCurrency}${this.decimalPipe.transform(currOutcome.summary.cost, '1.2-2')} | Profit: ${this.userPreferences.displayCurrency}${this.decimalPipe.transform(currOutcome.summary.profit, '1.2-2')}`;
        },
        footer: (tooltipItem, data) => {
          // Storing current profit value for quick access
          const currValue = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index] as number;
          // Displaying current profit by value from chart
          return `Total profit: ${this.userPreferences.displayCurrency}${this.decimalPipe.transform(currValue, '1.2-2')}`;
        },
      },
    }
  };
  /**
   * Chart colors
   *
   * @type {Color[]}
   * @memberof TradeupResultChartComponent
   */
  public lineChartColors: Color[] = [
    { // dark grey
      backgroundColor: 'rgba(148,0,177,0.2)',
      borderColor: 'rgba(100,100,100,0.8)',
      pointBackgroundColor: 'rgba(180,180,180,1)',
      pointBorderColor: 'rgba(36,36,36,1)',
      pointHoverBackgroundColor: 'rgba(0,159,0,.7)',
      pointHoverBorderColor: 'rgba(0,159,0,1)'
    },
  ];
  /**
   * Plugins that are used by chart
   *
   * @memberof TradeupResultChartComponent
   */
  chartPlugins = [{
    // Src: https://github.com/chartjs/Chart.js/issues/3071#issuecomment-434702818
    beforeRender: (x: any, options: any) => {
      const c = x.chart;
      const dataset = x.data.datasets[0];
      const yScale = x.scales['y-axis-0'];
      const yPos = yScale.getPixelForValue(0);

      const gradientFill = c.ctx.createLinearGradient(0, 0, 0, c.height);
      gradientFill.addColorStop(0, 'rgba(5,110,5,.45)');
      gradientFill.addColorStop(yPos / c.height - 0.01, 'rgba(5,110,5,.45)');
      gradientFill.addColorStop(yPos / c.height + 0.01, 'rgba(110,5,5,.45)');
      gradientFill.addColorStop(1, 'rgba(110,5,5,.45)');

      const model = x.data.datasets[0]._meta[Object.keys(dataset._meta)[0]].dataset._model;
      model.backgroundColor = gradientFill;
    }
  }];
  /**
   * Total profit
   *
   * @private
   * @memberof TradeupResultChartComponent
   */
  private totalProfit = 0;
  /**
   * User preferences
   *
   * @private
   * @type {UserPreferences}
   * @memberof TradeupResultChartComponent
   */
  private userPreferences: UserPreferences;
  /**
   * Subscription that watches for user preference changes
   *
   * @private
   * @type {Subscription}
   * @memberof TradeupResultChartComponent
   */
  private preferenceChangeSubscription: Subscription = Subscription.EMPTY;
  constructor(
    private decimalPipe: DecimalPipe,
    private cdr: ChangeDetectorRef,
    private userPreferencesService: UserPreferencesLoaderService,
  ) {
    // Storing user preferences for quick access
    this.userPreferences = this.userPreferencesService.getPreferences();
  }

  ngOnInit() {
    // Initializing chart data
    this.initChartData();
    // Subscribing to user preference change in order to update them
    this.preferenceChangeSubscription = this.userPreferencesService.userPreferenceChange$
      .subscribe(prefs => {
        // Updating preferences
        this.userPreferences = prefs;
        // Marking that view has to be re-rendered because there are changes
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.preferenceChangeSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    // If simulated outcomes changed and its not a first change
    // then initializing chart data again
    if (!changes?.simulatedOutcomes?.firstChange) {
      this.initChartData();
    }
  }

  /**
   * Method initializes chart data for display
   *
   * @private
   * @memberof SimulateGraphComponent
   */
  private initChartData() {
    // Resetting total profit
    this.totalProfit = 0;
    // Clearing labels
    this.lineChartLabels = [];
    // Setting chart data
    this.lineChartData = [{
      label: '',
      pointRadius: 5,
      data: this.results
        .filter(result => result.outcome)
        .map((result, i) => {
          this.totalProfit += result.summary.profit;
          this.lineChartLabels.push(`#${i + 1}`);
          // Transforming to 2 signs after digit and converting back to number
          return +this.totalProfit.toFixed(2);
        })
    },
    ];
    // Marking view for check since we have updated chart data
    this.cdr.markForCheck();
  }
}

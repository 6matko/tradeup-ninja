import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { PriceFromFloatPipe } from '../../pipes/price-from-float/price-from-float.pipe';
import { TradeupOutcome } from '../../tradeup-search/tradeup.model';
@Component({
  selector: 'app-simulate-graph',
  templateUrl: './simulate-graph.component.html',
  styleUrls: ['./simulate-graph.component.scss'],
  providers: [PriceFromFloatPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulateGraphComponent implements OnInit, OnChanges {
  @Input() simulatedOutcomes: TradeupOutcome[];
  @Input() cost: number;
  @Input() stattrak: boolean;

  public lineChartData: ChartDataSets[] = [
    // { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  ];
  public lineChartLabels: Label[] = [];
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
      text: `Profit simulation`
    },
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => {
          // Storing for quick access
          const currOutcome = this.simulatedOutcomes[tooltipItem[0].index];
          // Displaying actual label (#4 for example), outcome name and outcome odds (multiplying by 100 to get value for percentager display)
          return `${tooltipItem[0].xLabel} ${currOutcome.item.name} (${(currOutcome.odds * 100).toFixed(2)}%)`;
        },
        label: (tooltipItem, data) => {
          // Storing for quick access
          const currOutcome = this.simulatedOutcomes[tooltipItem.index];
          // Getting outcome price
          const outcomeCost = this.priceFromFloat.transform(currOutcome.item, currOutcome.float, true, this.stattrak);
          // Displaying Outcome price
          return `Price after tax: $${this.decimalPipe.transform(outcomeCost, '1.2-2')}`;
        },
        footer: (tooltipItem, data) => {
          // Storing current profit value for quick access
          const currValue = data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index] as number;
          // Storing for quick access
          const currOutcome = this.simulatedOutcomes[tooltipItem[0].index];
          // Getting outcome price
          const outcomeCost = this.priceFromFloat.transform(currOutcome.item, currOutcome.float, true, this.stattrak);
          // Displaying current profit with "+" or "-" sign. Also displaying outcome profit (outcome price - tradeup cost)
          return `Profit: $${(outcomeCost - this.cost).toFixed(2)} | Total profit: ${currValue > 0 ? '+$' + currValue.toFixed(2) : '$' + currValue.toFixed(2)}`;
        },
      },
    }
  };
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

  private totalProfit = 0;
  constructor(
    private priceFromFloat: PriceFromFloatPipe,
    private decimalPipe: DecimalPipe,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    // Adding tradeup cost information to title
    this.lineChartOptions.title.text = `${this.lineChartOptions.title.text}. Tradeup cost: $${this.cost?.toFixed(2)}`;
    // Initializing chart data
    this.initChartData();
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
      data: this.simulatedOutcomes.map((outcome, i) => {
        const profit = this.priceFromFloat.transform(outcome.item, outcome.float, true, this.stattrak) - this.cost;
        this.totalProfit += profit;
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

import { Component, Input, OnInit } from '@angular/core';
import { TradeupOutcome } from '../../tradeup-search/tradeup.model';

@Component({
  selector: 'app-simulate-items',
  templateUrl: './simulate-items.component.html',
  styleUrls: ['./simulate-items.component.scss']
})
export class SimulateItemsComponent implements OnInit {
  @Input() simulatedOutcomes: TradeupOutcome[];
  @Input() cost: number;
  @Input() stattrak: boolean;
  constructor() { }

  ngOnInit() {
  }

}

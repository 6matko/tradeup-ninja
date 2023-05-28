import { Component, Input, OnInit } from '@angular/core';
import { InventoryItem } from '../inventory.model';

@Component({
  selector: '[app-inventory-item]',
  templateUrl: './inventory-item.component.html',
  styleUrls: ['./inventory-item.component.scss']
})
export class InventoryItemComponent implements OnInit {
  @Input() item: InventoryItem;
  @Input() order: number;
  constructor() { }

  ngOnInit() {
  }

}

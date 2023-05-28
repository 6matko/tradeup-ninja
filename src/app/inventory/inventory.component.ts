import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InventoryItem } from './inventory.model';
import { InventoryService } from './inventory.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit {
  inventory$: Observable<InventoryItem[]>;
  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.inventory$ = this.inventoryService.getInventory().pipe(
      // Sorting items by rarity
      map((items) => items.sort((a, b) => a.rarity - b.rarity))
    );
  }
}

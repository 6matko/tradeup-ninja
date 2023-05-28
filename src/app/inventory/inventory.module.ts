import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RarityToTextModule } from '../pipes/rarity-to-text/rarity-to-text.module';
import { InventoryItemComponent } from './inventory-item/inventory-item.component';
import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryComponent } from './inventory.component';
import { InventoryService } from './inventory.service';

@NgModule({
  imports: [CommonModule, InventoryRoutingModule, RarityToTextModule],
  declarations: [InventoryComponent, InventoryItemComponent],
  providers: [InventoryService],
})
export class InventoryModule {}

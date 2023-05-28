import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SkinPriceTableComponent } from './skin-price-table.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    SkinPriceTableComponent,
  ],
  exports: [
    SkinPriceTableComponent,
  ]
})
export class SkinPriceTableModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedTradeupService } from './shared-tradeup.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [],
  providers: [
    SharedTradeupService,
  ],
})
export class SharedTradeupModule { }

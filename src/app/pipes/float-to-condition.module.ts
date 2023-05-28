import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FloatToConditionPipe } from './float-to-condition.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [FloatToConditionPipe],
  exports: [FloatToConditionPipe],
})
export class FloatToConditionModule {}

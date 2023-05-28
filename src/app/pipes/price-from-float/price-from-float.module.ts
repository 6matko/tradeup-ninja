import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PriceFromFloatPipe } from './price-from-float.pipe';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        PriceFromFloatPipe,
    ],
    exports: [
        PriceFromFloatPipe,
    ],
})
export class PriceFromFloatModule { }

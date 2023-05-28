import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { SkinSelectAutocompleteModule } from '../@shared/skin-select-autocomplete/skin-select-autocomplete.module';
import { StickerPriceRoutingModule } from './sticker-price-routing.module';
import { StickerPriceComponent } from './sticker-price.component';
import { StickerPriceService } from './sticker-price.service';

@NgModule({
  imports: [
    CommonModule,
    StickerPriceRoutingModule,
    NgSelectModule,
    SkinSelectAutocompleteModule,
    NgbDropdownModule,
    NgbPopoverModule,
    NgbTooltipModule,
    FormsModule,
  ],
  declarations: [
    StickerPriceComponent,
  ],
  providers: [
    StickerPriceService,
  ],
})
export class StickerPriceModule { }

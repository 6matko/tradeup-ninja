import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { TextHighlightModule } from '../../pipes/text-highlight/text-highlight.module';
import { SkinSelectAutocompleteComponent } from './skin-select-autocomplete.component';

@NgModule({
  imports: [
    CommonModule,
    NgbTypeaheadModule,
    FormsModule,
    TextHighlightModule,
  ],
  declarations: [
    SkinSelectAutocompleteComponent,
  ],
  exports: [
    SkinSelectAutocompleteComponent,
  ]
})
export class SkinSelectAutocompleteModule { }

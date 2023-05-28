import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterByPropertyPipe } from './filter-by-property.pipe';

@NgModule({
   imports: [
      CommonModule,
   ],
   exports: [
      FilterByPropertyPipe,
   ],
   declarations: [
      FilterByPropertyPipe,
   ]
})
export class FilterByPropertyModule { }

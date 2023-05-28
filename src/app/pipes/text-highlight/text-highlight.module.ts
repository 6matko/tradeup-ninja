import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TextHighlightPipe } from './text-highlight.pipe';

@NgModule({
   imports: [
      CommonModule,
   ],
   exports: [
      TextHighlightPipe,
   ],
   declarations: [
      TextHighlightPipe,
   ]
})
export class TextHighlightModule { }

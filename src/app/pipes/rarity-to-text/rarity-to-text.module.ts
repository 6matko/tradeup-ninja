import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RarityToTextPipe } from './rarity-to-text.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [RarityToTextPipe],
  exports: [RarityToTextPipe],
})
export class RarityToTextModule {}

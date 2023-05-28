import { Pipe, PipeTransform } from '@angular/core';
import { WeaponRarity } from '../../tradeup-search/tradeup.model';

@Pipe({
  name: 'rarityToText',
})
export class RarityToTextPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const rarityText = WeaponRarity[value];
    return rarityText || '???';
  }
}

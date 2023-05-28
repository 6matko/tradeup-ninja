import { Pipe, PipeTransform } from '@angular/core';
import { Weapon } from '@server/items';
import { getPrice } from '../../tradeup-search/tradeup-shared-utils';

@Pipe({
  name: 'priceFromFloat',
})
export class PriceFromFloatPipe implements PipeTransform {
  transform(value: Weapon, float?: number, withoutTax?: boolean, stattrak?: boolean): any {
    const price = getPrice(value, float, stattrak, withoutTax);

    // Checking if we actually have price. If price is "-1" then its special case where we couldn't get index or price
    // so we don't know price and therefore returning "-" as unknown price
    return price !== -1 ? price : '-';
  }
}

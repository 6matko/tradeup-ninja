import { Component, Input } from '@angular/core';
import { Weapon } from '@server/items';
import { ConditionForPriceDisplay } from '../../input-overview/input-overview.model';
import { getConditionsForPrices, getPrice } from '../../tradeup-search/tradeup-shared-utils';
@Component({
  selector: 'app-skin-price-table',
  templateUrl: './skin-price-table.component.html',
  styleUrls: ['./skin-price-table.component.scss'],
})
export class SkinPriceTableComponent {
  /**
   * Skin for which price should be shown
   *
   * @type {Weapon}
   * @memberof SkinPriceTableComponent
   */
  @Input() item: Weapon;
  /**
   * Indicates if normal prices should be shown.
   * By default `true`
   *
   * @type {boolean}
   * @memberof SkinPriceTableComponent
   */
  @Input() showNormalPrices: boolean = true;
  /**
   * Indicates if stattrak prices should be shown.
   * By default `true`
   *
   * @type {boolean}
   * @memberof SkinPriceTableComponent
   */
  @Input() showStattrakPrices: boolean = true;
  /**
   * Indicates if table header should be shown.
   * By default `true`
   *
   * @type {boolean}
   * @memberof SkinPriceTableComponent
   */
  @Input() showHeader: boolean = true;
  /**
   * Index of condition that should be highlighted.
   * By default `-1` aka none
   *
   * @type {number}
   * @memberof SkinPriceTableComponent
   */
  @Input() highlightedIndex: number = -1;
  /**
   * Conditions for display in price table
   *
   * @type {ConditionForPriceDisplay[]}
   * @memberof SkinPriceTableComponent
   */
  conditionsForPrices: ConditionForPriceDisplay[] = [];
  constructor() {
    // Filling conditions for price display
    this.conditionsForPrices = getConditionsForPrices();
  }

  /**
   * Method gets price for specific skin based on its float
   *
   * @param {Weapon} skin Skin
   * @param {number} float Skin float
   * @param {number} stattrak Prices for stattrak
   * @param {boolean} [withoutTax] Optional flag that will return skin price without steam tax
   * @returns {number} Returns skin price
   * @memberof InputOverviewComponent
   */
  getSkinPrice(skin: Weapon, float: number, stattrak: boolean, withoutTax?: boolean): number {
    return getPrice(skin, float, stattrak, withoutTax);
  }
}

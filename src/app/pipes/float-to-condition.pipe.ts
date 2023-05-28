import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'floatToCondition',
})
export class FloatToConditionPipe implements PipeTransform {
  transform(value: any, args?: any, noBrackets?: boolean): any {
    // Full rarity name without valuee
    if (args === 'fullwithout') {
      if (noBrackets) {
        return this.getTextCondition(+value, true);
      } else {
        return `(${this.getTextCondition(+value, true)})`;
      }
      // Short rarity name without value
    } else if (args === 'shortwithout') {
      if (noBrackets) {
        return this.getTextCondition(+value);
      } else {
        return `(${this.getTextCondition(+value)})`;
      }
    } else {
      // Short rarity name with float value
      return `${value} (${this.getTextCondition(+value)})`;
    }
  }

  /**
   * Method gets text value for condition ("FN", "MW", etc...)
   *
   * @param {number} float Float value
   * @returns {string} Returns string that represents condition in text format. For example "FN"
   * @param {boolean} [fullName] Optional flag that tells if full float names should be displayed. For example "Factory New"
   * @memberof FloatToConditionDirective
   */
  getTextCondition(float: number, fullName?: boolean): string {
    // Fixing float to 7 decimals because otherwise calculations might be incorrect.
    // Initially picked "6" because for display we are displaying 7 decimals but there was an error with "0.0699996"...
    // ...this number was floating to 0.07 and FN skin was considered as MW
    // Example:
    // 0.6999999... for display will be 0.07 and actually should be threated as MW, not FN.
    // Without this fix price was taken for FN exterior and it was incorrect.
    // NOTE: Previously we were rounding to 2 decimals but then values like "0.0665" were rounded to "0.07"
    // and therefore threated as "MW" but actually it was still "FN"
    const fixedFloat = +float.toFixed(7);
    switch (true) {
      case fixedFloat < 0.07:
        return fullName ? 'Factory New' : 'FN';
      case fixedFloat < 0.15:
        return fullName ? 'Minimal Wear' : 'MW';
      case fixedFloat < 0.38:
        return fullName ? 'Field-Tested' : 'FT';
      case fixedFloat < 0.45:
        return fullName ? 'Well-Worn' : 'WW';
      case fixedFloat < 1:
        return fullName ? 'Battle-Scarred' : 'BS';
      default:
        return '???';
    }
  }
}

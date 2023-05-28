import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DatePickerOptions } from '@ngx-tiny/date-picker';
import { Subscription } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';
import { WeaponRarity } from '../../tradeup-search/tradeup.model';
import { ResultFilter } from './tradeup-result-filter.model';

@Component({
  selector: 'app-tradeup-result-filter',
  templateUrl: './tradeup-result-filter.component.html',
  styleUrls: ['./tradeup-result-filter.component.scss']
})
export class TradeupResultFilterComponent implements OnInit, OnDestroy {
  /**
   * Options for date (range) picker
   *
   * @type {DatePickerOptions}
   * @memberof TradeupResultFilterComponent
   */
  rangeDatePickerOptions: DatePickerOptions = {
    selectRange: true,
  };
  /**
   * Tradeup result filter form
   *
   * @type {FormGroup}
   * @memberof TradeupResultFilterComponent
   */
  filterForm: FormGroup;
  /**
   * List of available rarities (numeric value of enum)
   *
   * @type {number[]}
   * @memberof TradeupResultFilterComponent
   */
  rarities: number[] = [WeaponRarity.Consumer, WeaponRarity.Industrial, WeaponRarity.MilSpec, WeaponRarity.Restricted, WeaponRarity.Classified];
  /**
   * Rarity enum. Used in markup for rarity value (name) display
   *
   * @memberof TradeupResultFilterComponent
   */
  rarityEnum = WeaponRarity;
  /**
   * Event emitter that emits changes made to tradeup result filtering form
   *
   * @type {EventEmitter<ResultFilter>}
   * @memberof TradeupResultFilterComponent
   */
  @Output() filterChange: EventEmitter<ResultFilter> = new EventEmitter();
  /**
   * Subscription that watches for form value changes
   *
   * @private
   * @type {Subscription}
   * @memberof TradeupResultFilterComponent
   */
  private formChangeSubscription: Subscription = Subscription.EMPTY;
  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.createForm();
  }

  ngOnInit() {
    // Subscribing to filter form value changes so we can update results immediately
    this.formChangeSubscription = this.filterForm.valueChanges
      .pipe(
        // Adding debounce for performance
        debounceTime(300),
        // Skipping initial value changes
        skip(1),
      )
      .subscribe((filterValues: ResultFilter) => {
        // Emitting filter values
        this.emitFilterValues(filterValues);
      });
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.formChangeSubscription.unsubscribe();
  }

  /**
   * Method adjusts filter values with appropriate list of selected rarities
   *
   * @param {boolean[]} rarities Selected rarity array (on form its array of boolean values)
   * @returns {number[]} Returns list with selected rarity values
   * @memberof TradeupResultFilterComponent
   */
  getAdjustedRarities(rarities: boolean[]): number[] {
    // Getting selected rarity valuees
    const selectedRarities = rarities
      .map((checked: any, i: string | number) => checked ? this.rarities[i] : null)
      // Filtering only truthy values
      .filter((val: any) => val);
    // Returning correct rarity values
    return selectedRarities;
  }

  /**
   * Method resets filter form and sets default values
   *
   * @memberof TradeupResultFilterComponent
   */
  resetFilter() {
    // Resetting form and setting default values
    this.filterForm.reset({
      completed: true,
      incomplete: true,
      stattrak: true,
      normal: true,
      successful: true,
      failed: true,
      filterText: '',
      rarities: [...this.rarities],
      completedRange: { start: new Date('01/01/2020'), end: new Date() }
    });
  }

  /**
   * Method creates form
   *
   * @private
   * @memberof TradeupResultFilterComponent
   */
  private createForm() {
    this.filterForm = this.formBuilder.group({
      completed: [true],
      incomplete: [true],
      stattrak: [true],
      normal: [true],
      successful: [true],
      failed: [true],
      filterText: [''],
      rarities: new FormArray([...this.rarities.map(rarity => new FormControl(rarity))]),
      completedRange: [{ start: new Date('01/01/2020'), end: new Date() }]
    });
  }

  /**
   * Method emits filter values via Event Emitter
   *
   * @private
   * @param {ResultFilter} filterValues Filter values that should be emitted
   * @memberof TradeupResultFilterComponent
   */
  private emitFilterValues(filterValues: ResultFilter) {
    // Adjusting filter with correct selected rarity list
    filterValues.rarities = this.getAdjustedRarities(filterValues.rarities as any[]);
    // Emitting newly selected filter values
    this.filterChange.emit(filterValues);
  }
}

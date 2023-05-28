import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Weapon } from '@server/items';
import { Subscription } from 'rxjs';
import { PriceFromFloatPipe } from '../../pipes/price-from-float/price-from-float.pipe';
import { getFloatIndexForPrice } from '../../tradeup-search/tradeup-shared-utils';
import { StructuredCollectionWithItems } from '../../tradeup-search/tradeup.model';
import { CalculatorAddItemModalComponent } from '../calculator-add-item-modal/calculator-add-item-modal.component';
import { CalculatorCopiedValues, CalculatorFormInputItem, CalculatorInputItem } from '../tradeup-calculator.model';
import { TradeupCalculatorService } from '../tradeup-calculator.service';

@Component({
  selector: 'tr[app-calculator-input-item]',
  templateUrl: './calculator-input-item.component.html',
  styleUrls: ['./calculator-input-item.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  providers: [PriceFromFloatPipe],
})
export class CalculatorInputItemComponent implements OnInit, OnDestroy {
  /**
   * Input item form control
   *
   * @type {FormControl}
   * @memberof CalculatorInputItemComponent
   */
  @Input() control: FormControl;
  /**
   * List with available skins for autocomplete
   *
   * @type {Weapon[]}
   * @memberof CalculatorInputItemComponent
   */
  @Input() skinsForAutocomplete: Weapon[] = [];
  /**
   * Structurized collections with items in them
   *
   * @type {StructuredCollectionWithItems}
   * @memberof CalculatorInputItemComponent
   */
  @Input() structCollections: StructuredCollectionWithItems;
  /**
   * Currently copied values for calculator
   *
   * @type {CalculatorCopiedValues}
   * @memberof CalculatorInputItemComponent
   */
  copiedValue: CalculatorCopiedValues;
  /**
   * Current item value on form. Used for quick access
   *
   * @readonly
   * @type {CalculatorFormInputItem}
   * @memberof CalculatorInputItemComponent
   */
  get item(): CalculatorFormInputItem {
    return this.control.value;
  }
  /**
   * Stored calculator form (parent form). Used for quick access
   *
   * @type {FormGroup}
   * @memberof CalculatorInputItemComponent
   */
  calculatorForm: FormGroup;
  /**
   * Indicates if its stattrak trade up
   *
   * @type {boolean}
   * @memberof CalculatorInputItemComponent
   */
  get stattrak() {
    return this.calculatorForm.get('stattrak').value;
  }
  /**
   * Subscription that watches for copied value changes
   *
   * @private
   * @type {Subscription}
   * @memberof CalculatorInputItemComponent
   */
  private copiedValueSubscription: Subscription = Subscription.EMPTY;
  /**
   * Subscription that watches for float input change
   *
   * @private
   * @type {Subscription}
   * @memberof CalculatorInputItemComponent
   */
  private floatValueChangeSubscription: Subscription = Subscription.EMPTY;
  /**
   * Subscription that watches for STATTRAK option change on parent (calculator) form
   *
   * @private
   * @type {Subscription}
   * @memberof CalculatorInputItemComponent
   */
  private stattrakChangeSubscription: Subscription = Subscription.EMPTY;
  constructor(
    private tradeupCalculatorService: TradeupCalculatorService,
    private parentForm: FormGroupDirective,
    private priceFromFloat: PriceFromFloatPipe,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    // Storing current form group for quick access
    this.calculatorForm = this.parentForm.form;

    // Subscribing to Stattrak value change on calculator form in order to reset price.
    // This is needed for feature where user can quickly switch between normal and stattrak
    // tradeup without losing items in calculator
    this.stattrakChangeSubscription = this.calculatorForm.get('stattrak').valueChanges.subscribe((stattrak) => {
      // If current item has stattrak (is not empty) then resetting its price
      if (this.control.value.inputItem) {
        this.resetPrice();
      }
    });

    // Subscribing to copied value change (in order to receive copied values)
    this.copiedValueSubscription = this.tradeupCalculatorService.getCopiedValueChanges().subscribe((copiedValues) => {
      // Storing new copied values for display and usage
      this.copiedValue = copiedValues;
    });

    // Subscribing to float value change
    this.floatValueChangeSubscription = this.control.get('float').valueChanges.subscribe((float) => {
      // Getting float index based on float
      const floatIndex = getFloatIndexForPrice(float);
      // Setting float index based on new float
      if (floatIndex !== -1) {
        // NOTE: Not emitting event because its more of a helper field
        // and it changes only when float changes so this control valueChange
        // will be fired by float change anyways. If this will be emitting event
        // then items formGroup valueChange will be firing twice
        this.control.get('floatIndex').setValue(floatIndex, { emitEvent: false });
      }

      // If float has changed then we are considering that its a different item rather
      // than same and thu clearing item ID for current spot. Not emitting event to prevent
      // any additional logic because we don't need it
      this.control.get('inventoryItemId').setValue(null, { emitEvent: false });
    });
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.copiedValueSubscription.unsubscribe();
    this.floatValueChangeSubscription.unsubscribe();
    this.stattrakChangeSubscription.unsubscribe();
  }

  /**
   * Method selects skin and updates input item information
   *
   * @param {Weapon} skin Selected skin (Input item)
   * @memberof CalculatorInputItemComponent
   */
  selectSkin(skin: Weapon) {
    // Adding validators for float input based on skin params
    this.addFloatValidationToControl(this.control, skin);

    // Calculating average value of float min and max value and taking only 7 digits.
    // With "+" converting it back to number
    const avgFloat = +((skin.min + skin.max) / 2).toFixed(7);
    // Getting float index
    const floatIndex = getFloatIndexForPrice(avgFloat);

    // Updating form value with selected item
    this.control.patchValue({
      inputItem: skin,
      // Setting initial float to be average value
      float: avgFloat,
      // Setting float index
      floatIndex,
      // Getting price for our average float
      price: this.priceFromFloat.transform(skin, avgFloat, false, this.calculatorForm.get('stattrak').value),
    });
  }

  /**
   * Method opens add item modal. On success replaces current input item with new
   *
   * @memberof CalculatorInputItemComponent
   */
  openAddItemModal() {
    // Opening modal
    const modalRef = this.modalService.open(CalculatorAddItemModalComponent, { size: 'xl', scrollable: true });
    // Setting necessary data that should be available in modal component
    modalRef.componentInstance.structCollection = this.structCollections;
    modalRef.componentInstance.itemsForSelect = this.skinsForAutocomplete;
    modalRef.componentInstance.rarity = this.calculatorForm.get('rarity').value;
    modalRef.componentInstance.stattrak = this.stattrak;
    modalRef.componentInstance.itemsInCalculator = this.calculatorForm.get('items').value;

    // Waiting for response
    modalRef.result.then(
      (item: CalculatorFormInputItem) => {
        // Adding validators for float input based on skin params
        this.addFloatValidationToControl(this.control, item.inputItem);
        // Updating form control with selected input item
        this.control.patchValue(item);

        // NOTE: this should remain empty even if not used to avoid errors`
      },
      () => {}
    );
  }

  /**
   * Method resets item price to API price
   *
   * @memberof CalculatorInputItemComponent
   */
  resetPrice() {
    // Getting API price for current item
    const price = this.priceFromFloat.transform(this.item.inputItem, this.item.float, false, this.stattrak);
    // Updating price on control
    this.control.get('price').setValue(price);
  }

  /**
   * Method copies float value
   *
   * @param {number} val Copied float value
   * @memberof CalculatorInputItemComponent
   */
  copyFloat(val: number) {
    // Updating copied values float
    this.copiedValue.float = val;
    // Emitting updated value
    this.tradeupCalculatorService.emitCopiedValues(this.copiedValue);
  }

  /**
   * Method sets copied float value on control
   *
   * @memberof CalculatorInputItemComponent
   */
  pasteFloat() {
    // Pasting float only if we have copied value
    if (this.copiedValue.float) {
      // Getting index of copied float
      const floatIndex = getFloatIndexForPrice(this.copiedValue.float);
      // Updating form control
      this.control.patchValue({
        float: this.copiedValue.float,
        floatIndex,
      });
    }
  }

  /**
   * Method copies price value
   *
   * @param {number} val Copied price value
   * @memberof CalculatorInputItemComponent
   */
  copyPrice(val: number) {
    // Updating copied values price
    this.copiedValue.price = val;
    // Emitting updated value
    this.tradeupCalculatorService.emitCopiedValues(this.copiedValue);
  }

  /**
   * Method sets copied price value on control
   *
   * @memberof CalculatorInputItemComponent
   */
  pastePrice() {
    // Pasting price only if we have copied value
    if (this.copiedValue.price || this.copiedValue.price >= 0) {
      this.control.patchValue({
        price: this.copiedValue.price,
      });
    }
  }

  /**
   * Method clear current input item
   *
   * @memberof CalculatorInputItemComponent
   */
  clearItem() {
    this.control.reset();
  }

  /**
   * Method duplicates input item into free slot
   *
   * @memberof CalculatorInputItemComponent
   */
  duplicateItem() {
    const itemsOnForm = this.calculatorForm.get('items').value as CalculatorInputItem[];
    // Searching for index of input item that has no selected weapon
    const indexOfEmptySlot = itemsOnForm.findIndex((item) => !item.inputItem);
    // If we found empty slot then duplicating current item into that slot
    if (indexOfEmptySlot !== -1) {
      this.addFloatValidationToControl(this.calculatorForm.get(`items.${indexOfEmptySlot}`), this.item.inputItem);
      this.calculatorForm.get(`items.${indexOfEmptySlot}`).setValue(this.item);
    }
  }

  /**
   * Method adds required and min-max validations on current input item control
   * based on skins min-max float values
   *
   * @private
   * @param {Weapon} skin Selected weapon (skin) from which min-max float values will be taken
   * @memberof CalculatorInputItemComponent
   */
  private addFloatValidationToControl(ctrl: AbstractControl, skin: Weapon) {
    // Adding validators for float input based on skin params
    ctrl.get('float').setValidators([
      // Setting that float is required because with "setValidators" we are assigning
      // new validators instead of appending
      Validators.required,
      // Setting min value depending on min float
      Validators.min(skin.min),
      // Setting max value depending on max float
      Validators.max(skin.max),
    ]);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Weapon } from '@server/items';

@Component({
  selector: 'app-set-custom-price-modal',
  templateUrl: './set-custom-price-modal.component.html',
  styleUrls: ['./set-custom-price-modal.component.scss'],
})
export class SetCustomPriceModalComponent implements OnInit {
  /**
   * Form for custom price setting
   *
   * @type {FormGroup}
   * @memberof SetCustomPriceModalComponent
   */
  customPriceForm: FormGroup;
  /**
   * Current item price
   *
   * @type {number}
   * @memberof SetCustomPriceModalComponent
   */
  currentPrice: number = 0;
  /**
   * Current skin for which price will be changed
   *
   * @type {Weapon}
   * @memberof SetCustomPriceModalComponent
   */
  currentItem: Weapon;
  /**
   * Current skin float
   *
   * @type {number}
   * @memberof SetCustomPriceModalComponent
   */
  currentItemFloat: number;
  constructor(public activeModal: NgbActiveModal, private formBuilder: FormBuilder) {
    this.createForm();
  }

  ngOnInit() {
    // Initializing initial price value
    this.customPriceForm.get('priceBeforeTax').setValue(this.currentPrice || 0);
  }

  /**
   * Method saves new price and closes modal
   *
   * @memberof SetCustomPriceModalComponent
   */
  savePrice() {
    this.activeModal.close(this.customPriceForm.value);
  }

  /**
   * Method creates new form for setting priice
   *
   * @private
   * @memberof SetCustomPriceModalComponent
   */
  private createForm() {
    this.customPriceForm = this.formBuilder.group({
      priceBeforeTax: [0, [Validators.required, Validators.min(0)]],
    });
  }
}

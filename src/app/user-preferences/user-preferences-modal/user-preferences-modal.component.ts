import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { from } from 'rxjs';
import { untilDestroyed } from '../../@core';
import { UserPreferencesLoaderService } from '../user-preferences-loader.service';
import { UserPreferences } from '../user-preferences.model';

@Component({
  selector: 'app-user-preferences-modal',
  templateUrl: './user-preferences-modal.component.html',
  styleUrls: ['./user-preferences-modal.component.scss']
})
export class UserPreferencesModalComponent implements OnInit, OnDestroy {
  /**
   * User preferences form
   *
   * @type {FormGroup}
   * @memberof UserPreferencesModalComponent
   */
  preferencesForm: FormGroup;
  /**
   * Informative description about what is display currency
   *
   * @type {string}
   * @memberof UserPreferencesModalComponent
   */
  displayCurrencyDescription: string;
  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private ngxIndexedDB: NgxIndexedDBService,
    private userPreferencesService: UserPreferencesLoaderService,
  ) {
    // Initializing form with current values
    this.createForm(this.userPreferencesService.getPreferences());
  }

  ngOnInit() {
    // Setting display currency description content
    this.displayCurrencyDescription = `Display currency is just a visual representation of your own currency.
    It is mainly used in trade up results page to indicate how much money you spent/made.
    Idea for this setting is to allow you to set your own "currency" which will help you to understand how much money have spent/made. It is used only for visual and doesn't affect anything`;
  }

  ngOnDestroy() {
  }

  /**
   * Method saves user preferences to DB
   *
   * @memberof UserPreferencesModalComponent
   */
  savePreferences() {
    // Storing preferences for quick access
    const preferences = this.preferencesForm.value;

    // Updating preferences
    from(this.userPreferencesService.updatePreferences(preferences))
      // TODO: Investigate if this pipe really works 🤔
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() => {
        // Closing modal with current preferences if they were stored successfully
        this.activeModal.close(preferences);
      });
  }

  /**
   * Method creates preferences form
   *
   * @private
   * @param {UserPreferences} preferences Current preferences. These values will be initially displayed on form
   * @memberof UserPreferencesModalComponent
   */
  private createForm(preferences: UserPreferences) {
    this.preferencesForm = this.formBuilder.group({
      // NOTE: We need this ID to update in DB
      id: [preferences.id],
      displayCurrency: [preferences.displayCurrency, Validators.required],
      darkMode: [preferences.darkMode],
      // NOTE: If we don't add language here then on update it will get removed
      // and we don't want this. We know that we will use it one day so let it be here
      // but just hidden
      language: [preferences.language]
    });
  }
}

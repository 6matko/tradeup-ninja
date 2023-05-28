import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SharedTradeupService } from '../../@shared/shared-tradeup/shared-tradeup.service';
import { UserPreferencesLoaderService } from '../../user-preferences/user-preferences-loader.service';
import { UserPreferences } from '../../user-preferences/user-preferences.model';
import { AddEditResultModalComponent } from '../add-edit-result-modal/add-edit-result-modal.component';
import { TradeupResult } from '../tradeup-result.model';

@Component({
  selector: 'app-result-preview',
  templateUrl: './result-preview.component.html',
  styleUrls: ['./result-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultPreviewComponent implements OnInit, OnDestroy {
  /**
   * Tradeup result for display
   *
   * @type {TradeupResult}
   * @memberof ResultPreviewComponent
   */
  @Input() result: TradeupResult;
  /**
   * Event emitter that emits updated tradeup result
   *
   * @type {EventEmitter<TradeupResult>}
   * @memberof ResultPreviewComponent
   */
  @Output() resultModified: EventEmitter<TradeupResult> = new EventEmitter();
  /**
   * Event emitter that emits ID of removed tradeup result
   *
   * @type {EventEmitter<number>}
   * @memberof ResultPreviewComponent
   */
  @Output() resultRemoved: EventEmitter<number> = new EventEmitter();
  /**
   * Flag indicates if floating block with tradeup input item info should be shown or not
   *
   * @type {boolean}
   * @memberof ResultPreviewComponent
   */
  showInputInfo: boolean;
  /**
   * Flag indicates if result cart is collapsed
   *
   * @type {boolean}
   * @memberof ResultPreviewComponent
   */
  collapsed: boolean = false;
  /**
   * Flag indicates if current tradeup result is being processed (loading indicator should be shown)
   *
   * @type {boolean}
   * @memberof ResultPreviewComponent
   */
  processing: boolean;
  /**
   * User preferences
   *
   * @type {UserPreferences}
   * @memberof ResultPreviewComponent
   */
  userPreferences: UserPreferences;
  /**
   * Subscription that watches for user preference changes
   *
   * @private
   * @type {Subscription}
   * @memberof ResultPreviewComponent
   */
  private preferenceChangeSubscription: Subscription = Subscription.EMPTY;
  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private sharedTradeupService: SharedTradeupService,
    private userPreferencesService: UserPreferencesLoaderService,
  ) {
    // Storing user preferences for quick access
    this.userPreferences = this.userPreferencesService.getPreferences();
  }

  ngOnInit() {
    // Subscribing to user preference change in order to update them
    this.preferenceChangeSubscription = this.userPreferencesService.userPreferenceChange$
      .subscribe(prefs => {
        // Updating preferences
        this.userPreferences = prefs;
        // Marking that view has to be re-rendered because there are changes
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    // Unsubscribing to avoid memory leaks
    this.preferenceChangeSubscription.unsubscribe();
  }

  /**
   * Method opens modal for adding/editing result
   *
   * @param {TradeupResult} [result] Result to modify. If not passed then new result will be added
   * @param {number} [resultIndex] Index of result that is about to be modified
   * @memberof TradeupResultComponent
   */
  openEditResultModal(result: TradeupResult) {
    // Opening modal
    const modalRef = this.modalService.open(AddEditResultModalComponent, {
      size: 'lg',
    });

    // Passing result to modal in order to modify it
    modalRef.componentInstance.resultForEdit = Object.assign({}, result);

    // Waiting for response
    modalRef.result.then(updatedResult => {
      // Emitting updated result
      this.resultModified.emit(updatedResult);
    }, () => { });
  }

  /**
   * Method removes result from DB and emits event about it
   *
   * @memberof ResultPreviewComponent
   */
  removeResult() {
    // Marking that current tradeup results is being processed
    this.processing = true;
    // Marking view for check because we have to display information that something
    // is currently happening with tradeup
    this.cdr.markForCheck();
    this.sharedTradeupService.removeResult(this.result.id)
      .pipe(
        // Disabling loading indicator
        finalize(() => this.processing = false)
      )
      .subscribe(() => {
        // Emitting event to remove currect result
        this.resultRemoved.emit(this.result.id);
      });
  }

  /**
   * Method toggles result card collapse state
   *
   * @memberof ResultPreviewComponent
   */
  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}

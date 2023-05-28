import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CalculatorCopiedValues } from './tradeup-calculator.model';

@Injectable({
  providedIn: 'root'
})
export class TradeupCalculatorService {
  /**
   * Behavior subject that is meant for tracking changes when user copies values like price/float
   *
   * @private
   * @type {BehaviorSubject<CalculatorCopiedValues>}
   * @memberof TradeupCalculatorService
   */
  private copiedValueBehaviorSubject: BehaviorSubject<CalculatorCopiedValues> = new BehaviorSubject(new CalculatorCopiedValues());
  constructor() { }

  /**
   * Method emits new values for behavior subject that notifies about new copied values
   *
   * @param {CalculatorCopiedValues} copiedValues New values with changes
   * @memberof TradeupCalculatorService
   */
  emitCopiedValues(copiedValues: CalculatorCopiedValues) {
    this.copiedValueBehaviorSubject.next(copiedValues);
  }

  /**
   * Method returns `Observable` for watching copied values (calculator)
   *
   * @returns {Observable<CalculatorCopiedValues>} Returns `Observable` with copied values for calculator
   * @memberof TradeupCalculatorService
   */
  getCopiedValueChanges(): Observable<CalculatorCopiedValues> {
    return this.copiedValueBehaviorSubject.asObservable();
  }
}

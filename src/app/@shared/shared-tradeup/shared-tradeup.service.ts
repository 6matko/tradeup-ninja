import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { from, Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { TradeupResult } from '../../tradeup-result/tradeup-result.model';

@Injectable({
  providedIn: 'root'
})
export class SharedTradeupService {

  constructor(
    private ngxIndexedDb: NgxIndexedDBService,
  ) { }

  /**
   * Method gets tradeup reesults from DB
   *
   * @returns {Observable<TradeupResult[]>} Returns `Observable` with tradeup results
   * @memberof SharedTradeupService
   */
  getResults(): Observable<TradeupResult[]> {
    return from(this.ngxIndexedDb.getAll('result'))
      .pipe(
        // Taking only 1st value and completing subscription
        take(1),
        // Creating new subscription to emit/watch changes
        switchMap(results => {
          // NOTE: Backward compatibility.
          // Walking through each result and in case if any result
          // has outcome (is completed) but doesn't have completed date set then setting
          // completed date to be modified date. In case if there is no modified date then by default
          // will be setting 28.06.2020 (28th June of 2020). This is approx. public launch date
          const finalResults = (results as TradeupResult[]).map(result => {
            if (result.outcome && !result.completed) {
              result.completed = result.modified || new Date('06/28/2020');
            }
            return result;
          });
          // Returning final results with necessary adjustments
          return of(finalResults);
        })
      );
  }

  /**
   * Method adds new tradeup result to DB
   *
   * @param {TradeupResult} result Tradeup result that has to be added
   * @returns {number} Returns `Observable` with ID of newly created tradeup result
   * @memberof SharedTradeupService
   */
  addNewResult(result: TradeupResult): Observable<number> {
    // Setting creation date. In one case it can be for newly added tradeup, other case is for import
    if (!result.created) {
      result.created = new Date();
    }

    // Since we are creating new object we can set modified date the same as created, BUT
    // only if we didn't do it previously
    if (!result.modified) {
      result.modified = result.created;
    }
    // If user specified outcome item then we are considering current result as "Completed"
    // and since its creation then we are setting the same date as creation aka Now.
    if (result.outcome) {
      result.completed = result.created || result.modified || new Date();
    }
    return from(this.ngxIndexedDb.add('result', result));
  }

  /**
   * Method saves changes to tradeup result
   *
   * @param {TradeupResult} updatedResult Modified result that has updated values
   * @returns Returns `Observable` with IndexedDB event
   * @memberof SharedTradeupService
   */
  updateResult(updatedResult: TradeupResult) {
    // Setting modified date
    updatedResult.modified = new Date();
    // Before saving result we are getting current state of tradeup result in order to check
    // if it has outcome or not (to decide about completion state)
    return from(this.ngxIndexedDb.getByID<TradeupResult>('result', updatedResult.id))
      .pipe(
        // Taking only 1st value and completing subscription
        take(1),
        // Creating new subscription to emit/watch changes
        switchMap(result => {
          // Checking if current result from DB doesn't have outcome set and in case
          // if it really doesn't have, but updated result HAS then it means that this
          // tradeup can be considered as completed and we need to set Completed date
          if (updatedResult.outcome) {
            // In case if current result doesn't have outcome or updated result doesn't have completed date
            // we are setting completed date for this tradeup
            if (!result.outcome || !updatedResult.completed) {
              updatedResult.completed = updatedResult.modified;
            }
          }
          // Otherwise if there is no outcome then clearing completed date
          if (!updatedResult.outcome) {
            updatedResult.completed = null;
          }

          // Saving updated result
          return from(this.ngxIndexedDb.update('result', updatedResult));
        })
      );
  }

  /**
   * Method removes result from DB
   *
   * @param {number} resultId ID of result that needs to be removed
   * @returns Returns `Observable` with IndexedDB event
   * @memberof SharedTradeupService
   */
  removeResult(resultId: number) {
    return from(this.ngxIndexedDb.delete('result', resultId));
  }
}

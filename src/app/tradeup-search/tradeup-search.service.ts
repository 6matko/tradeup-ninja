import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootObject } from '@server/items';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TradeupSearchService {
  /**
   * Stored skin items. Used for caching (to prevent identical request)
   *
   * @private
   * @type {RootObject}
   * @memberof TradeupSearchService
   */
  private storedItems: RootObject;
  constructor(private http: HttpClient) {}

  /**
   * Method gets skins (items) with prices and other useful info
   *
   * @param {boolean} [force] Should items be requested from server, ignoring caching
   * @returns {Observable<RootObject>} Rerturns `Observable` with skin information
   * @memberof TradeupSearchService
   */
  getItems(force?: boolean): Observable<RootObject> {
    // If we have storeed items then returning them as Observable instead of requesting again
    // NOTE: If we have to force request then ignoring and going straight to request
    if (!force && this.storedItems) {
      return of(this.storedItems);
    } else {
      return this.http.get<RootObject>(`/api/items`).pipe(
        // Storing items (caching) after we received them
        tap((items) => (this.storedItems = items))
      );
    }
  }
}

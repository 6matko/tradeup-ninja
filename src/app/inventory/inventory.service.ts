import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { InventoryItem } from './inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private storedInventoryBehaviorSubject = new BehaviorSubject<InventoryItem[]>(null);
  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Method requests current users CSGO inventory with Weapons (incl. float values)
   *
   * @returns {Observable<InventoryItem[]>} Returns `Observable` with list of inventory items (CSGO Skins)
   * @memberof InventoryService
   */
  getInventory(): Observable<InventoryItem[]> {
    // If we have stored inventory then returning it
    if (this.storedInventoryBehaviorSubject.value) {
      return this.storedInventoryBehaviorSubject.asObservable();
    } else {
      // Otherwise requesting inventory from server
      return this.http.get<InventoryItem[]>(`/api/inventory`)
        .pipe(
          map(inventory => {
            // Setting helper flag "stattrak" for easier work
            inventory.map(item => {
              // Storing information if current item is Stattrak. "killeaterscoretype" is NOT NULL only for Stattrak but
              // this value can also be 0
              item.stattrak = item.killeaterscoretype !== null;
              // Returning updated item
              return item;
            });
            // Returning updated inventory
            return inventory;
          }),
          catchError(err => of([])),
          tap(inventory => this.storedInventoryBehaviorSubject.next(inventory))
        );
    }
  }
}

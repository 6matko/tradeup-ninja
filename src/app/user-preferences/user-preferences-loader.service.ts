import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { from, Observable, of, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserPreferences } from './user-preferences.model';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesLoaderService {
  /**
   * Observable that contains user preference changes
   *
   * @type {Observable<UserPreferences>}
   * @memberof UserPreferencesLoaderService
   */
  userPreferenceChange$: Observable<UserPreferences>;
  /**
   * Subject that notifies when user preference change with new value
   *
   * @private
   * @type {Subject<UserPreferences>}
   * @memberof UserPreferencesLoaderService
   */
  private userPreferenceChangeSubject: Subject<UserPreferences> = new Subject();
  /**
   * Stored user preferences
   *
   * @private
   * @type {UserPreferences}
   * @memberof UserPreferencesLoaderService
   */
  private preferences: UserPreferences;
  /**
   * Store name in IndexedDB
   *
   * @private
   * @memberof UserPreferencesLoaderService
   */
  private readonly preferenceStoreName = 'preferences';
  /**
   * Flag indicates if current platform is browser
   *
   * @private
   * @type {boolean}
   * @memberof UserPreferencesLoaderService
   */
  private isBrowser: boolean;
  constructor(
    private ngxIndexedDB: NgxIndexedDBService,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {
    this.userPreferenceChange$ = this.userPreferenceChangeSubject.asObservable();
    // Storing information if current platform is browser
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Methods loads user preferences (Creates with default values if no preferences)
   *
   * @returns
   * @memberof UserPreferencesLoaderService
   */
  loadPreferences() {
    if (this.isBrowser) {
      // Getting user preferences from IndexedDB
      return from(this.ngxIndexedDB.getAll(this.preferenceStoreName))
        .pipe(
          switchMap((preferences: UserPreferences[]) => {
            // If we don't have user preferences in DB then creating them
            if (!preferences?.length) {
              // Creating new user preferences with default values
              const prefs = new UserPreferences();
              // Saving to DB
              return from(this.ngxIndexedDB.add(this.preferenceStoreName, prefs))
                .pipe(
                  // Since IndexedDB on creation returns ID and not newly created object
                  // then we have to manually return newly created preferences.
                  // With Object.assign we are creating new object with ID and merging default values into it
                  switchMap(id => of(Object.assign({ id }, prefs))),
                );
            } else {
              // Otherwise returning first (only) user prefeerences from DB
              return of(preferences[0]);
            }
          })
        )
        // Since its a factory and we are using SSR (with AOT) we need to convert it to promise
        .toPromise()
        .then((preferences: UserPreferences) => {
          // Storing user preferences
          this.preferences = preferences;
          // Returning user preferences
          return this.preferences;
        })
        .catch((error: any) => {
          console.error(error);
        });
    } else {
      // If current platform is server then returning user prefrences with default values
      // and returning promise because it is needed for AOT
      return of(new UserPreferences())
        .toPromise();
    }
  }

  /**
   * Method returns user preferences
   *
   * @returns {UserPreferences} Returns User preferences
   * @memberof UserPreferencesLoaderService
   */
  getPreferences(): UserPreferences {
    return this.preferences;
  }

  /**
   * Simple preference update. Used to save latest preferences
   *
   * @param {UserPreferences} preferences Preferences that have to be updated
   * @memberof UserPreferencesLoaderService
   */
  updatePreferences(preferences: UserPreferences) {
    // Updating stored preferences
    this.preferences = preferences;
    // Updating preferences
    return this.ngxIndexedDB.update(this.preferenceStoreName, preferences)
      .then(() => {
        // Notifying about preference change
        this.userPreferenceChangeSubject.next(preferences);
      });
  }
}

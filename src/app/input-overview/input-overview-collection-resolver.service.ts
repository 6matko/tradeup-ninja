import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TradeupSearchService } from '../tradeup-search/tradeup-search.service';

@Injectable({
  providedIn: 'root'
})
export class InputOverviewCollectionResolverService implements Resolve<any> {

  constructor(
    private tradeupSearchService: TradeupSearchService,
    private title: Title,
    private router: Router,
    private meta: Meta,
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    // Storing current route query params for quick acceess
    const collectionKey = route.paramMap.get('collectionKey');
    // If query param is not passed then redirecting user to search
    if (!collectionKey) {
      this.router.navigate(['/input-overview/collections']);
    } else {
      // Otherwise requesting items and finding collection information
      return this.getItems(collectionKey);
    }
  }

  /**
   * Method gets items for search, stores them and gets information about provided collection
   *
   * @private
   * @param {string} collectionKey Collection key for which information should be gotten
   * @returns Returns `Observable` with information about collection by its key
   * @memberof InputOverviewCollectionResolverService
   */
  private getItems(collectionKey: string) {
    // Requesting items for search and starting search
    return this.tradeupSearchService.getItems()
      .pipe(
        switchMap(data => {
          // Trying to decompress and get tradeup information from query params
          try {
            const collectionSkins = Object.values(data.weapons).filter(skin => skin.collection.key.toLowerCase() === collectionKey.toLowerCase());
            if (collectionSkins?.length) {
              // Setting SEO stuff
              this.setSEO(collectionSkins[0].collection.name, `Information about ${collectionSkins[0].collection.name} and items in this collection`);

              // Returning collection skins as Observable
              return of(collectionSkins);
            } else {
              return of({ error: `Couldn't find information about this collection` });
            }

          } catch (error) {
            // In case if something went wrong then displaying error message
            return of({ error: `Couldn't find information about this collection` });
          }
        }),
        catchError(err => {
          return of({ error: `Could not load items. Please try again later` });
        })
      );
  }

  /**
   * Method sets necessary SEO tags
   *
   * @private
   * @param {string} title Page title to set
   * @param {string} desc Page description to set
   * @memberof InputOverviewCollectionResolverService
   */
  private setSEO(title: string, desc: string) {
    // Setting page title
    this.title.setTitle(`${title} - Tradeup Ninja`);
    this.meta.updateTag({
      name: 'description',
      content: desc,
    });
  }
}

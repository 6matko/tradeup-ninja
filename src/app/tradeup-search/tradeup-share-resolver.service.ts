import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { RootObject, Weapon } from '@server/items';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { FALLBACK_NAME_IDS } from '../@core/fallback-name-ids';
import { decodeWeaponName, decompressQuery } from '../@core/utils';
import { TradeupSearchService } from './tradeup-search.service';
import { calculateTradeUp, structurizeItemByCollection } from './tradeup-search.utils';
import { TradeupShareInfo } from './tradeup-share-display/tradeup-share-display.model';
import { getDistinctInputItems } from './tradeup-shared-utils';
import { BestTradeup, TradeupItemWithFloat } from './tradeup.model';

@Injectable({
  providedIn: 'root',
})
export class TradeupShareResolverService implements Resolve<any> {
  constructor(
    private tradeupSearchService: TradeupSearchService,
    private title: Title,
    private router: Router,
    private meta: Meta
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    // Storing current route query params for quick acceess
    const queryString = route.queryParamMap.get('tradeup');
    // If query param is not passed then redirecting user to search
    if (!queryString) {
      this.router.navigate(['/search']);
    } else {
      // Otherwise requesting items that we will need to recreate tradeup
      return this.getItems(queryString);
    }
  }

  /**
   * Method gets items for search and stores them
   *
   * @private
   * @param {string} queryString Compressed query params
   * @returns
   * @memberof TradeupShareResolverService
   */
  private getItems(queryString: string) {
    // Requesting items for search and starting search
    return this.tradeupSearchService.getItems().pipe(
      switchMap((data) => {
        // Trying to decompress and get tradeup information from query params
        try {
          // Decompressing query and getting tradeup information for recreation
          const tradeupInfo = decompressQuery<TradeupShareInfo>(queryString);

          // Recreating tradeup
          const tradeup = this.createTradeup(tradeupInfo, data);

          // Getting collection names for name and description creation
          const collectionNames = this.getCollectionNames(tradeup);

          // Creating tradeup name for display and Title tag
          const tradeupName = this.createTradeupName(tradeup, collectionNames, tradeupInfo.stattrak);
          // Creating tradeup description for display in Meta tag
          const tradeupDesc = this.createTradeupDescription(tradeup, collectionNames, tradeupInfo.stattrak);

          // Setting SEO stuff
          this.setSEO(tradeupName, tradeupDesc, tradeup.tradeupSummary.mostExpensivePrizeItem);

          // Returning gathered / recreated information on tradeup as Observable
          return of({
            tradeup,
            tradeupName,
            tradeupInfo,
          });
        } catch (error) {
          // In case if something went wrong then displaying error message
          return of({ error: `Couldn't recreate trade up` });
        }
      }),
      catchError((err) => {
        return of({ error: `Could not load items. Please try again later` });
      })
    );
  }

  /**
   * Method creates tradeup from passed recreation information (via sharing)
   *
   * @private
   * @param {TradeupShareInfo} tradeupInfo Information about tradeup for recreation
   * @param {RootObject} storedItems List of stored items (root object)
   * @returns {BestTradeup} Returns recreated tradeup
   * @memberof TradeupShareResolverService
   */
  private createTradeup(tradeupInfo: TradeupShareInfo, storedItems: RootObject): BestTradeup {
    // Initializing new tradeup
    const tradeup = new BestTradeup();
    // Filling tradeup with empty values because afterwards we will replace them with new ones.
    // Doing that to avoid errors
    tradeup.items = new Array(10).fill(new TradeupItemWithFloat());

    // Going through each item ID provided via sharing and filling our
    // tradeup information with actual items based on their name (item) IDs
    tradeupInfo.itemIds.forEach((itemId, i) => {
      // Getting weapon name by name ID
      const weaponName = decodeWeaponName(itemId) || FALLBACK_NAME_IDS[itemId];
      // Getting weapon by weapon name
      const weapon = storedItems.weapons[weaponName];
      // Setting input item with found weapon and setting float accordingly
      tradeup.items[i] = new TradeupItemWithFloat({ item: weapon, float: tradeupInfo.floats[i] });
    });

    // Structurizing items by collections in order to generate summary for tradeup
    const structCollection = structurizeItemByCollection(storedItems);
    // Calculating tradeup summary
    const calculatedSummary = calculateTradeUp(tradeup.items, tradeupInfo.stattrak, structCollection);
    // As final step assigning calculated summary for our tradeup
    tradeup.tradeupSummary = calculatedSummary;
    return tradeup;
  }

  /**
   * Method gets collection names from tradeup items
   *
   * @private
   * @param {BestTradeup} tradeup Tradeup with input items
   * @returns {string[]} Returns list with collection names of used items in tradeup
   * @memberof TradeupShareResolverService
   */
  private getCollectionNames(tradeup: BestTradeup): string[] {
    // Getting only distinct input items for tradeup and counting their amount
    // so we could display not 10 items (including duplicates) but only a few distinct
    // with amount column to represent how many of specific item is needed
    const distinctInputItems = getDistinctInputItems(tradeup.items);

    // Creating list with unique collection names
    const collectionNames: string[] = [];
    // Going through each distinct item and storing collection names
    distinctInputItems.forEach((distinct) => {
      // Storing unique collection names for display in title
      if (!collectionNames.includes(distinct.item.collection.name)) {
        collectionNames.push(distinct.item.collection.name);
      }
    });
    return collectionNames;
  }

  /**
   * Method creates tradeup name based on most expensive item and collections used
   *
   * @private
   * @param {BestTradeup} tradeup Recreated tradeup. From this tradeup name will be created
   * @param {string[]} collectionNames List with collections that are used for this tradeup
   * @param {boolean} [stattrak] Indicates if its stattrak tradeup
   * @returns {string} Returns tradeup name based on tradeup details
   * @memberof TradeupShareResolverService
   */
  private createTradeupName(tradeup: BestTradeup, collectionNames: string[], stattrak?: boolean): string {
    // Returning created tradeup name
    return `${stattrak ? 'StatTrak™ ' : ''}${tradeup.tradeupSummary.mostExpensivePrizeItem.name} (${(
      tradeup.tradeupSummary.mostExpensiveOdds * 100
    ).toFixed(2)}%) | ${tradeup.tradeupSummary.mostExpensivePrizeItem.rarity.name} | ${collectionNames.join(' + ')}`;
  }

  /**
   * Method creates tradeup description based on most expensive outcome, success odds and collection information
   *
   * @private
   * @param {BestTradeup} tradeup Recreated tradeup. From this tradeup name will be created
   * @param {string[]} collectionNames List with collections that are used for this tradeup
   * @param {boolean} [stattrak] Indicates if its stattrak tradeup
   * @returns {string} Returns tradeup name based on tradeup details
   */
  private createTradeupDescription(tradeup: BestTradeup, collectionNames: string[], stattrak?: boolean) {
    // Returning created tradeup description
    return `${stattrak ? 'StatTrak™ ' : ''}${tradeup.tradeupSummary.mostExpensivePrizeItem.name} (${(
      tradeup.tradeupSummary.mostExpensiveOdds * 100
    ).toFixed(2)}% odds) ${tradeup.tradeupSummary.mostExpensivePrizeItem.rarity.name} trade up. ${(
      tradeup.tradeupSummary.outcomeSummary.successOdds * 100
    ).toFixed(0)}% profit outcomes. ${collectionNames.join(' + ')}`;
  }

  /**
   * Method sets necessary SEO tags
   *
   * @private
   * @param {string} title Page title to set
   * @memberof TradeupShareResolverService
   */
  private setSEO(title: string, desc: string, mostExpensivePrize?: Weapon) {
    // Setting page title
    this.title.setTitle(`${title} - Tradeup Ninja`);
    this.meta.updateTag({
      name: 'description',
      content: desc,
    });
    if (mostExpensivePrize) {
      // Setting OG image
      this.meta.updateTag({
        property: 'og:image',
        content: mostExpensivePrize.image,
      });
    }
  }
}

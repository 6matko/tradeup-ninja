import { HttpException, HttpService, HttpStatus, Injectable } from '@nestjs/common';
import { from, of } from 'rxjs';
import { catchError, concatMap, map, switchMap, toArray } from 'rxjs/operators';
import { RarityName } from '../items';

@Injectable()
export class InventoryService {
  constructor(
    private http: HttpService
  ) { }

  // async create(steamProfile: any): Promise<SteamUser | undefined> {
  //     // Creating new user
  //     const newUser = new this.userModel({
  //         steamId: steamProfile.id,
  //         displayName: steamProfile.displayName,
  //         // Taking "full" version of photo. If not present then trying first available photo.
  //         // If none of them were found then setting as null cause there is no photo
  //         photoUrl: steamProfile.photos[2]?.value ?? steamProfile.photos[0]?.value ?? null,
  //     });
  //     // Saving new user and returning it
  //     return newUser.save();
  // }

  /**
   * Method gets users CSGO inventory with weapon detailed information (including Float)
   *
   * @param {string} steamId Steam ID of user which inventory should be requested
   * @returns {(Promise<any[] | undefined>)} Retruns list with CSGO weapons in inventory and detailed information about them (float and others)
   * @memberof InventoryService
   */
  async getCSGOInventory(steamId: string): Promise<any[] | undefined> {
    // Requesting users inventory from STEAM
    return (
      this.http
        // .get(`https://steamcommunity.com/profiles/${steamId}/inventory/json/730/2`)
        .get(`http://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=1000`)
        .pipe(
          catchError((err) => {
            if (err.response.status === 429) {
              throw new HttpException('Too many requests to STEAM. Try again later', HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new HttpException('Could not get inventory from STEAM. Try again later', HttpStatus.BAD_GATEWAY);
          }),
          map((response) => response.data),
          switchMap((steamInventory) => {
            // Getting list of items for request. We need on Weapons
            const listOfItems = this.getInventoryItemListForRequest(steamInventory.descriptions, steamInventory.assets);

            // Gathering information about every item in inventory
            return from(listOfItems).pipe(
              // With concatMap we are walking through every item in inventory and sending request
              // to get information about this item. ConcatMap here guarantees that new request will be
              // sent ONLY when previous was completed. We need this because our server that uses CSGO-Float
              // solution accepts only 1 request per item for performance and rate limit reasons
              concatMap((itemInInventory: any) => {
                // Storing asset ID if we have it
                const assetId = itemInInventory ? itemInInventory.assetId : null;

                // Adjusting request link by updating some placeholders
                const requestLink = itemInInventory.actions[0].link
                  .replace('%owner_steamid%', steamId)
                  .replace('%assetid%', assetId);
                // Sending request to get information about this item
                // NOTE: May 27, 2023 - This will not work because service is not available anymore.
                // It is making requests to self hosted service of: https://github.com/csgofloat/inspect
                return this.http
                  .get<any>(`http://tradeupninjafloat.westeurope.azurecontainer.io/?url=${requestLink}`)
                  .pipe(
                    // We need only iteminfo value because it contains everything we need
                    map((itemResponse) => itemResponse.data.iteminfo),
                    // In case of error returning "null" as no information was found
                    catchError((err) => of(null))
                  );
              }),
              // Converting all results to array because we used concatMap and because we need them as array
              toArray(),
              // Returning non falsy values only
              map((items) => items.filter((item) => item))
            );
          })
        )
        .toPromise()
    );
  }

  /**
   * Method filters items from Steam inventory and takes only Weapons with Actions property
   *
   * @private
   * @param {any[]} itemDescriptions List with Steam items (CSGO)
   * @returns Returns list with weapons for further request
   * @memberof InventoryService
   */
  private getInventoryItemListForRequest(itemDescriptions: any, itemsInInventory: any) {
    // Geetting list of inventory items with description
    const inventoryItemsWithDescription: any[] = itemDescriptions
      // Filtering only Weapons with Actions because we can request information by action URL
      // and we need this information only for weapons
      .filter((itemDesc: any) => {
        // Creating key-value array of enum values because we will need it
        // Src: https://stackoverflow.com/a/55008428/5347059
        const rarityEnumArray = Object.entries(RarityName).map(([key, value]) => ({ key, value }));

        // Searching for rarity tag because it contains necessary inform ation
        const rarityTag = itemDesc.tags.find((tag) => tag.category === 'Rarity');
        // Checking if current item has Rarity that can be found only on Weapons (Like "Restricted" and others)
        // NOTE: Ignoring "Stock" rarity
        const hasWeaponRarity = rarityEnumArray.find(
          (rarity) => rarityTag.localized_tag_name === rarity.value && rarityTag.localized_tag_name !== RarityName.Stock
        );
        // If current item has actions & rarity that belongs only to weapon then returning it.
        // Also we are excluding souvenir items
        return itemDesc.actions && hasWeaponRarity && !itemDesc.market_hash_name.includes('Souvenir');
      });

    // Creating list with finalized items for request
    const itemsForRequest = [];
    // Going through items from inventory and adding according items to list for request
    itemsInInventory.forEach((inventoryItem: any) => {
      // Searching for current inventory item's description
      const itemDesc = inventoryItemsWithDescription.find(
        (item) => item.classid === inventoryItem.classid && item.instanceid === inventoryItem.instanceid
      );
      // If we found information about current inventory item then adding it to resulting
      // list with items for request and adding assetId so its accessible
      if (itemDesc) {
        itemsForRequest.push({
          ...itemDesc,
          assetId: inventoryItem.assetid,
        });
      }
    });

    // Returning list of items for request
    return itemsForRequest;
  }
}

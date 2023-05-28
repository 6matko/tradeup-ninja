import { CACHE_MANAGER, HttpService, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import * as fs from 'fs';
import { Observable, bindNodeCallback, forkJoin, from, of, throwError } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';
import * as vdf from 'simple-vdf';
import { CsgoTraderAppData, CsgoTraderAppItem } from '../core/interfaces/csgoTraderApp.interface';
import { CSGOFloatSchema } from '../core/interfaces/csgofloat.interface';
import { createSyncResult, getWearIndex, objectKeysToLowerCase } from '../utils';
import { ItemSync, WeaponEnum } from './items.model';

export const DOT_CHAR = '\\u002e';
const STEAM_ITEMS_GAME_URL =
  'https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/scripts/items/items_game.txt';
const STEAM_CSGO_ENGLISH_URL =
  'https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/resource/csgo_english.txt';
const FILES_FOLDER = __dirname + '/files';

@Injectable()
export class ItemsService {
  private csgoTraderAppPrices$ = this.httpService.get<CsgoTraderAppData>(
    'https://prices.csgotrader.app/latest/prices_v6.json'
  );
  private csgoFloatSchema$ = this.httpService.get<CSGOFloatSchema>('https://csgofloat.com/api/v1/schema');
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async getLatest(): Promise<ItemSync> {
    // Initially trying to get items from in-memory store (cache)
    return from(this.cacheManager.get<ItemSync>('ninja-items'))
      .pipe(
        switchMap((itemsInCache) => {
          // If we got items in memory then returning them
          if (itemsInCache) {
            return of(itemsInCache);
            // Otherwise trying to get them from saved file
          } else {
            return this.getFile<ItemSync>('ninja-items-csgotraderapp.json')
              .pipe(
                tap((data: ItemSync) => {
                  // Storing file in cache to prevent reading all the time
                  // Time to live (TTL) set to 3h because items are syncing once in 3h
                  this.cacheManager.set('ninja-items', data, { ttl: 10800 });
                })
              );
          }
        })
      )
      .toPromise();
  }

  /**
   * Method gets stickers from DB and returns only name, image and nameID
   *
   * @returns {Promise<SteamItem[]>} Returns `Promise` with list of stickers as simplified model (name, image and nameID)
   * @memberof ItemsService
   */
  async getStickers(): Promise<any[]> {
    return this.getFile('csgotraderapp.json').pipe(
      map((data: CsgoTraderAppData) => {
        return Object.keys(data).map((key) => {
          return { market_hash_name: data[key].market_name, image: '' };
        });
      })
    ).toPromise();
    // return from(
    //   this.itemModel
    //     .find({ market_hash_name: /Sticker \| / })
    //     .select('market_hash_name nameID image -_id')
    //     .exec()
    // ).toPromise();
  }

  // /**
  //  * Method gets items from SteamAPI and inserts them into DB
  //  *
  //  * @returns {Promise<steamitems[]>}
  //  * @memberof ItemsService
  //  */
  // async addInitialItems(): Promise<steamitems[]> {
  //   return await lastValueFrom(this.steamAPI$
  //     .pipe(
  //       switchMap((request) => this.itemModel.insertMany([...request.data.data])
  //         .catch((err) => {
  //           console.log(err);
  //           return err;
  //         }))
  //     )) as Promise<steamitems[]>;
  //   // .toPromise();
  // }

  /**
   * Method gets items from SteamAPI and inserts them into DB
   *
   * @returns {Promise<SteamItem[]>}
   * @memberof ItemsService
   */
  @Cron(CronExpression.EVERY_3_HOURS)
  syncItems() {
    console.log(`Syncing items`, new Date().toUTCString());
    this.csgoTraderAppPrices$
      .pipe(
        switchMap((request) => {
          const data = {};

          Object.keys(request.data).forEach((key) => {
            data[key] = request.data[key];
            data[key]['market_name'] = key;
          });
          return this.saveFile(data, 'csgotraderapp.json');
        }),
        map((data: CsgoTraderAppData) => {
          const weaponNameStringForRegex = Object.values(WeaponEnum).join('|');
          const strRegExPattern = '^(?=.*(' + weaponNameStringForRegex + '))(?:(?!Souvenir).)+$';
          // Making sure that we ignore Souvenirs and entries without wear. THere are some weird entries like
          // sticker The AWPer and similar to that
          const validKeys = Object.keys(data).filter(
            (k) => k.match(new RegExp(strRegExPattern, 'i')) && getWearIndex(k) !== -1
          );
          const validSkinMap = new Map<string, CsgoTraderAppItem>();
          validKeys.forEach((k) => {
            // Adding skin map only if we have price.
            // There are a few cases with wrong naming like:
            // "M4A4 | Emperor (Factory New)" which doesn't exist.
            // "M4A4 | The Emperor (Factory New)" exists. So for first case
            // price will be null and thats logical because its wrong skin.
            if (data[k].csgotrader.price) {
              validSkinMap.set(k, data[k]);
            }
          });
          return validSkinMap;
        }),
        tap((data) => {
          // FIXME: Remove afterwards
          console.log(data.size);
        }),
        switchMap((data) => this.syncItemsForItemSync(data))
      )
      .toPromise();
  }

  syncItemsForItemSync(allWeapons: Map<string, CsgoTraderAppItem>) {
    console.log(`Syncing items FOR NINJA`, new Date().toUTCString());

    return this.csgoFloatSchema$.pipe(
      // If there was an error from CSGO Float then trying to get stored data
      catchError((err) => this.getFile('csgofloat.json').pipe(catchError(() => of(null)))
      ),
      switchMap((response: AxiosResponse<CSGOFloatSchema> | CSGOFloatSchema) => {
        if ('data' in response) {
          // Saving CSGOFloat response as a fallback
          return this.saveFile(response.data, 'csgofloat.json');
        }

        // If from stored file and not from direct request then returning stored CSGO Float data
        if (response && !('data' in response)) {
          return of(response);
        } else {
          // Otherwise returning object with schema that is required for work.
          // In the end result will be null anyways
          return of({ weapons: null });
        }
      }),
      map((data) => data.weapons),
      concatMap((csgoFloatWeapons) => forkJoin([of(csgoFloatWeapons), this.getParsedIngameData()])),
      switchMap(([csgoFloatWeapons, parsedIngameData]) => {
        const outputSyncResults = createSyncResult(
          parsedIngameData.parsedItemsGame,
          parsedIngameData.parsedCsgoEnglish,
          allWeapons,
          csgoFloatWeapons
        );

        return this.saveResultsToFile(outputSyncResults);
      })
    );
  }

  private getParsedIngameData(): Observable<{ parsedCsgoEnglish: any; parsedItemsGame: any }> {
    // Using forkJoin to get both files in parallel (async)
    return forkJoin([
      this.httpService.get(STEAM_CSGO_ENGLISH_URL, { responseType: 'text' }),
      this.httpService.get(STEAM_ITEMS_GAME_URL, { responseType: 'text' }),
    ]).pipe(
      map((data: any[]) => {
        // Storing data for quick access
        const [csgoEnglish, itemsGame] = data;

        const parsedCsgoEnglish = objectKeysToLowerCase(vdf.parse(csgoEnglish.data)['lang']['Tokens']);
        const parsedItemsGame = vdf.parse(itemsGame.data)['items_game'];

        // Manually adding some skins to cases that were removed previously
        // NOTE: These values are taken from "item_sets.items"
        // USP-S | Orion (Huntsman, Classified)
        parsedItemsGame.client_loot_lists['crate_community_3_legendary']['[cu_usp_spitfire]weapon_usp_silencer'] = '1';
        // MAC-10 | Curse (Huntsman, Restricted)
        parsedItemsGame.client_loot_lists['crate_community_3_mythical']['[cu_mac10_decay]weapon_mac10'] = '1';

        return { parsedCsgoEnglish, parsedItemsGame };
      }),
      catchError((err) => throwError(err))
    );
  }

  private saveFile(data: any, fileName: string) {
    // If folder exists then creating file in it
    if (fs.existsSync(FILES_FOLDER)) {
      return this.getSaveFileObservable(data, fileName).pipe(switchMap(() => of(data)));
      // Otherwise creating folder to avoid error that there is no folder
    } else {
      return from(fs.promises.mkdir(FILES_FOLDER)).pipe(
        // Saving file. No extra steps needed here because its part of automated sync process
        concatMap(() => this.getSaveFileObservable(data, fileName).pipe(switchMap(() => of(data)))
        )
      );
    }
  }

  /**
   * Method saves results that are needed for Tradeup Ninja to file (and caches). Used to minimize storage of DB
   * cause this data is read only anywayys
   *
   * @private
   * @param {ItemSync} outputSyncResult Syncing data
   * @param {SteamItem[]} allWeapons List of all weapons
   * @returns Returns void `Observable` when file is saved
   * @memberof ItemsService
   */
  private saveResultsToFile(outputSyncResult: ItemSync) {
    // Adjusting data before saving (removing dots and other)
    const adjustedDataForSaving = this.setupNinjaItems(outputSyncResult);

    // Time to live (TTL) set to 3h because items are syncing once in 3h
    this.cacheManager.set('ninja-items', adjustedDataForSaving, { ttl: 10800 });
    try {
      return this.saveFile(adjustedDataForSaving, 'ninja-items-csgotraderapp.json');
    } catch (error) {
      console.log(`Could not save Ninja Items >>>>>>>>`);
      console.error(error);
      return throwError('Something went wrong with items syncing');
    }
  }

  /**
   * Method adjusts items that are needed for Tradeup Ninja by manipulating data (removing dots and similar stuff)
   *
   * @private
   * @param {ItemSync} data Origin data
   * @returns {ItemSync} Returns updated data that is used for Tradeup Ninja work process
   * @memberof ItemsService
   */
  private setupNinjaItems(data: ItemSync): ItemSync {
    // Since we are not using DB anymore, we need to manually seet date when results were synced (updated)
    data.lastUpdate = new Date();

    // Performing final setup
    Object.keys(data.weapons).forEach((key) => {
      // Src: https://stackoverflow.com/a/14592469
      if (key.includes(DOT_CHAR)) {
        const oldKey = key;
        // Strange RegExp magic here. So there is an issue that we have our DOT_CHAR constant with escaping characters (\\)
        // and because of that its hard to replace everything back with dots.
        // Firstly we are replaciong all "\" characters with "-" because its not special char and we can easily find and replace it
        const newKey = key
          .replace(/\\/g, '-')
          // We are creating new RegExp with our CHAR variable but we have to replace all special characters (\) from it as well.
          // So after we removed "\\" from dot entity, we are replacing whats left back to "."
          .replace(new RegExp(DOT_CHAR.replace(/\\/g, ''), 'g'), '.')
          // Finally removing all "-" characters
          .replace(/-/g, '');

        Object.defineProperty(data.weapons, newKey, Object.getOwnPropertyDescriptor(data.weapons, oldKey));
        delete data.weapons[oldKey];
      }
    });
    return data;
  }

  /**
   * Method creates and returns `Observable` that is used for file saving
   *
   * @private
   * @param {ItemSync} dataForSave Data that has to be saved to file
   * @returns Returns `Observable` wrapper around file save function
   * @memberof ItemsService
   */
  private getSaveFileObservable(dataForSave: ItemSync, fileName: string = 'ninja-items.json'): Observable<unknown> {
    // Binding Node JS Callback method to Observable so we could use it in RxJS
    const fileToSave$ = bindNodeCallback(fs.writeFile).bind(fs);

    // Returning Observable from function that is responsible for file save
    return fileToSave$(`${FILES_FOLDER}/${fileName}`, JSON.stringify(dataForSave), { encoding: 'utf8' });
  }

  private getFile<T>(fileName: string): Observable<T> {
    // Binding Node JS Callback method to Observable so we could use it in RxJS
    const getFile$ = bindNodeCallback(fs.readFile).bind(fs);
    try {
      // Getting files to return it
      return getFile$(`${FILES_FOLDER}/${fileName}`, { encoding: 'utf8' })
        .pipe(
          map((content: string) => {
            // Parsing file cause content is stringified
            const data = JSON.parse(content) as T;
            return data;
          })
        );
    } catch (error) {
      // TODO: Maybe returning RxJS error is more logical
      // If file could not be found then throwing error
      throw new NotFoundException();
    }
  }
}

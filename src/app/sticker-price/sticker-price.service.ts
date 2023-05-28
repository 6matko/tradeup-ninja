import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CsgoTraderAppItemPrices, Sticker } from './sticker-price.model';

@Injectable({
  providedIn: 'root'
})
export class StickerPriceService {

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Method requests prices from CsgoTraderApp JSON
   *
   * @returns {Observable<CsgoTraderAppItemPrices>} Returns `Observable` with prices from CSGO Trader App JSON
   * @memberof StickerPriceService
   */
  getCsgoTraderAppPrices(): Observable<CsgoTraderAppItemPrices> {
    // return this.http.get<CsgoTraderAppItemPrices>(`assets/prices_v6.json`);
    return this.http.get<CsgoTraderAppItemPrices>(`/api/sp/prices`);
  }

  /**
   * Method gets all stickers with basic information
   *
   * @returns {Observable<Sticker[]>} Returns `Obseravble` with list of stickers
   * @memberof StickerPriceService
   */
  getStickers(): Observable<Sticker[]> {
    return this.http.get<Sticker[]>(`/api/items/stickers`);
  }
}

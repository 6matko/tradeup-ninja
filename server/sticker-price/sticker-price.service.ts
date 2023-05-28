import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { bindNodeCallback } from 'rxjs';
import { map } from 'rxjs/operators';
import { CsgoTraderAppData } from '../core/interfaces/csgoTraderApp.interface';

@Injectable()
export class StickerPriceService {
  constructor() { }

  getCsgoTraderAppPrices() {
    // Binding Node JS Callback method to Observable so we could use it in RxJS
    const getFile$ = bindNodeCallback(fs.readFile).bind(fs);

    return getFile$(__dirname + '/files/csgotraderapp.json')
      .pipe(
        map((data: CsgoTraderAppData) => {
          // Creating final object that will get returned
          const finalObj = {};
          // Excluding graffities and souvenir items
          Object.keys(data).forEach(key => {
            if (!key.toLowerCase().includes('graffiti') && !key.toLowerCase().includes('souvenir')) {
              finalObj[key] = data[key];
            }
          });
          // Returning final object that contains only necessary items
          return finalObj;
        }),
      )
      .toPromise();
  }
}

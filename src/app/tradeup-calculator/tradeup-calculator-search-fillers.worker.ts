import { Collection, Weapon } from '@server/items';
import * as _ from 'lodash';
import { calculateTradeUp } from '../tradeup-search/tradeup-search.utils';
import {
  getFloatIndexForPrice,
  getItemsForTradeupWithFloat,
  msToMinutesSeconds
} from '../tradeup-search/tradeup-shared-utils';
// tslint:disable-next-line:max-line-length
import {
  BestTradeup,
  CollectionItemWithInfo,
  DataObj,
  StructuredCollectionWithItems,
  TradeupItemWithFloat,
  TradeupSearchProgress,
  TradeupSearchSettings,
  TradeupSummary,
  WorkerResponse
} from '../tradeup-search/tradeup.model';
import { CalculatorInputItem } from './tradeup-calculator.model';

/// <reference lib="webworker" />

let collections: any[] = [];
let structCollections: StructuredCollectionWithItems[] = [];
let settings: TradeupSearchSettings;
let inputItems: CalculatorInputItem[] = [];

addEventListener('message', (evt) => {
  // Init
  const data = evt.data as DataObj;
  // Storing collection information for quick accesss
  collections = data.structCollections.map((col) => col.collection);
  // Storing structurizeed collections with items in them
  structCollections = data.structCollections;
  // Storing input items for quick access
  inputItems = data.inputItems;
  // Saving settings
  settings = data.settings;

  switch (data.cmd) {
    case 'stop':
      const workerResponse = new WorkerResponse<unknown>({
        msg: '<div class="text-danger">Worker stopped' + data.msg + '</div>',
        isHTML: true,
      });
      postMessage(workerResponse, undefined);
      // Terminating worker
      self.close();
      break;
    case 'start':
      const startTime = performance.now();

      calculateAvgPrices();

      const bestTradeups = searchTradeups(settings.rarity);
      const endTime = performance.now();

      const responseDTO: WorkerResponse<any> = {
        // tslint:disable-next-line:max-line-length
        msg: `<div class="font-weight-bold text-dark">Operation completed in <span class="text-danger">${msToMinutesSeconds(
          endTime - startTime
        )} seconds</span></div>`,
        isHTML: true,
        data: { structCollections, bestTradeups },
        sticky: true,
        completed: true,
      };

      postMessage(responseDTO, undefined);

      // Terminates the worker
      self.close();
      break;
    default:
      postMessage('Unknown cmd: ' + data.msg, undefined);
  }
});

function calculateAvgPricesByWear(skins: Weapon[], stattrak?: boolean): number[] {
  // Creating array with price sums and initially filling it with 0
  const priceSum = new Array(5).fill(0);
  const priceCount = new Array(5).fill(0);

  skins.forEach((skin) => {
    const skinPriceArray = stattrak ? skin.price.stattrak : skin.price.normal;
    // Acting only if property exists. There might be cases where there are no stattrak prices
    if (skinPriceArray) {
      for (let i = 0; i < skinPriceArray.length; i++) {
        const price = skinPriceArray[i];
        if (price) {
          priceSum[i] += price;
          priceCount[i]++;
        }
      }
    }
  });

  const avgPrices: number[] = [];
  priceSum.forEach((sum, i) => {
    // Calculating average price only if we have price count. Otherwise we dont
    // have it (Stattrak case) and we can just set that there is no price (0)
    if (priceCount[i] > 0) {
      avgPrices.push(sum / priceCount[i]);
    } else {
      avgPrices.push(0);
    }
  });
  return avgPrices;
}

function structurizeItemByCollection(
  resultArray: StructuredCollectionWithItems[],
  allCollections: Collection[],
  skin: Weapon
) {
  // Searching for existing collection to put new skin into it
  const foundSkinCollection =
    resultArray.length && resultArray.find((col) => col.collection.key === skin.collection.key);
  // If collection was not found then creating new one
  if (!foundSkinCollection) {
    resultArray.push(addNewCollection(skin));
  } else {
    // Checking if we already have array with items for this specific rarity in this specific collection.
    // If so then adding current skin to this collection for specific rarity
    if (foundSkinCollection.items[skin.rarity.value]) {
      foundSkinCollection.items[skin.rarity.value].skins.push(skin);
      // If not then creating it as new array
    } else {
      foundSkinCollection.items[skin.rarity.value] = new CollectionItemWithInfo();
      foundSkinCollection.items[skin.rarity.value].skins = [skin];
    }
  }
}

function calculateAvgPrices() {
  structCollections.map((col) => {
    const rarityKeys = Object.keys(col.items);
    rarityKeys.map((key) => {
      col.items[key].avgPricesNormal = calculateAvgPricesByWear(col.items[key].skins);
      col.items[key].avgPricesST = calculateAvgPricesByWear(col.items[key].skins, true);
    });
  });
}

function addNewCollection(skin: Weapon) {
  const collection = collections.find((col) => col.key === skin.collection.key);
  const newCollection: StructuredCollectionWithItems = {} as any;
  const skinRarityString = skin.rarity.value.toString();
  newCollection[skinRarityString] = {
    collection,
    items: {},
  };
  newCollection[skinRarityString].items[skinRarityString] = {};
  newCollection[skinRarityString].items[skinRarityString]['skins'] = [skin];
  // rarityItems['skins'] = [skin];

  // let rarityItems = (newCollection[skin.rarity.value.toString()] as StructuredCollectionWithItems).items[skin.rarity];
  // rarityItems = new CollectionItemWithInfo();
  // rarityItems.skins = [skin];

  return newCollection[skinRarityString];
}

function handleNullPricesForCheapestItems(cheapestItems: Weapon[]) {
  // Walking through every cheap item and checking if they have price
  cheapestItems.map((item, i) => {
    // If cheapest item doesn't have price then making current item as "null" that there is no
    // cheap item in this condition
    if (item && ((settings.stattrak && !item.price.stattrak[i]) || (!settings.stattrak && !item.price.normal[i]))) {
      cheapestItems[i] = null;
    }
  });
}

/**
 * Method gets available collections for search based on collections that should be included/excluded
 *
 * @param {Collection[]} [excludeCollections] Collections that should be excluded from search
 * @param {Collection[]} [includeCollections] Collections that should be included in search (Search will be done only with these collections)
 * @returns {StructuredCollectionWithItems[]} Returns list of structurized collections that comply provided params (excluded/included)
 */
function getAvailableCollectionsForSearch(
  excludeCollections?: Collection[],
  includeCollections?: Collection[]
): StructuredCollectionWithItems[] {
  // If both exclude and include collections are not defined then returning all collections to search in
  if (!excludeCollections?.length && !includeCollections?.length) {
    return structCollections;
  }
  // If excluded collections are set then search will ignore included collections
  if (excludeCollections?.length) {
    const collectionsWithoutExcluded = structCollections
      // Filtering collections that are not in excluded list
      .filter((col) => !excludeCollections.find((excludedCol) => excludedCol.key === col.collection.key));
    return collectionsWithoutExcluded;
  } else {
    const includedCollections = structCollections
      // Filtering collections that are included
      .filter((col) => includeCollections.find((includedCol) => includedCol.key === col.collection.key));
    return includedCollections;
  }
}

function getCheapestItemsFromEachCollection(
  rarity: number,
  minVolume: number = 0,
  excludeCollections?: Collection[],
  includeCollections?: Collection[]
) {
  // List with array of cheapest items for each collection grouped by wear (FN to BS)
  const cheapestItemsFromEachCollection: Weapon[][] = [];

  // Getting available collections for search based on excluded/included collections
  const collectionsToSearch = getAvailableCollectionsForSearch(excludeCollections, includeCollections);

  // Getting cheapest items for each collection
  collectionsToSearch.map((col) => {
    // Initializing array with cheapest items and filling it with nulls because
    // those nulls will be overwritten by cheapest items
    const cheapestItems: Weapon[] = new Array(5).fill(null);

    // Getting collection skins for specific rarity
    const collectionSkins = col.items[rarity]?.skins;
    const collectionHasNextItems = !!col.items[rarity + 1];
    // Checking if theree are skins for current collection in specific rarity
    // and if there are next rarity items for this collection
    if (collectionSkins && collectionHasNextItems) {
      collectionSkins.map((skin) => {
        for (let i = 0; i < cheapestItems.length; i++) {
          // Stroing reference to current cheap item for quick access
          const cheapItem = cheapestItems[i];
          const cheapItemPriceArray = settings.stattrak ? cheapItem?.price?.stattrak : cheapItem?.price?.normal;
          const skinPriceArray = settings.stattrak ? skin.price.stattrak : skin.price.normal;
          const skinVolumeArray = settings.stattrak ? skin.volume.stattrak : skin.volume.normal;
          // If we yet don't have a cheap item then checking if current skin has price for current wear
          // and if it does then setting it as cheapest skin. In next iterations we will compare them
          // NOTE: Checking if current skin volume is greater or equal to minimal volume. Otherwise we are not interested in it
          if (
            !cheapItem &&
            skinVolumeArray &&
            skinVolumeArray[i] >= minVolume &&
            skinPriceArray &&
            skinPriceArray[i]
          ) {
            cheapestItems[i] = skin;
          } else {
            if (
              // Setting current skin as cheapest in following cases:
              // 1. There is no current cheapest item for current wear and current skin has price for this wear
              // 2. Volume of this skin is greater or equal to minimal volume set in settings
              // 3. We have current cheapest item for current wear, current skin has price for this wear AND
              // price of currtent skin for current condition is cheaper than current cheap item price
              (!cheapItem &&
                skinVolumeArray &&
                skinVolumeArray[i] >= minVolume &&
                skinPriceArray &&
                skinPriceArray[i]) ||
              (cheapItem &&
                skinVolumeArray &&
                skinVolumeArray[i] >= minVolume &&
                skinPriceArray &&
                skinPriceArray[i] &&
                skinPriceArray[i] < cheapItemPriceArray[i])
            ) {
              cheapestItems[i] = skin;
            }
          }
        }
      });

      // Handling cases when there are no cheapest item for specific wear in collection
      handleNullPricesForCheapestItems(cheapestItems);

      // Adding found items for current collection
      cheapestItemsFromEachCollection.push(cheapestItems);
    }
  });
  return cheapestItemsFromEachCollection;
}

function searchTradeups(rarity: number) {
  // Getting cheapest items from each collection
  const cheapestSkinsFromEachCollection: Weapon[][] = getCheapestItemsFromEachCollection(
    rarity,
    settings.minVolume,
    settings.excludedCollections,
    settings.includedCollections
  );

  // Getting list with all items for tradeup from each collection
  const allItemsForTradeupWithFloat =
    getItemsForTradeupWithFloat(cheapestSkinsFromEachCollection, settings.difficulty) || [];

  // Initializing list with best tradeups found
  const bestTradeups: BestTradeup[] = [];
  // Setting up some informative variables like combination count (will be used as visual counter)
  const totalCombinations = Math.pow(allItemsForTradeupWithFloat.length, 2);
  let combinationsLeft = totalCombinations;

  postMessage(
    new WorkerResponse<unknown>({
      msg: `<div>Items available for tradeup: <b>${allItemsForTradeupWithFloat.length}</b>. Total combinations: ${totalCombinations}</div>`,
      isHTML: true,
      sticky: true,
    }),
    undefined
  );

  // Getting appropriate model with items for trade up search
  const itemsForCalculation = inputItems
    // Filtering only those items that have selected skin
    .filter((item) => Boolean(item.inputItem))
    // Converting input items from calculator to search item
    .map((item) => {
      // We need to clone current item into new variable because on price change all items
      // get affected due references. With deep clone we are not keeping references. Also
      // important notice is that we have to use deep clone because we have nested objects
      const uniqueItem = _.cloneDeep(item);

      // Creating empty item for search
      const itemWithFloat = new TradeupItemWithFloat();
      // FIXME: Implement based on provider
      // // Setting custom price on item based on if its stattrak or normal trade up
      // if (settings.stattrak) {
      //     uniqueItem.inputItem.stattrak_prices[uniqueItem.floatIndex] = uniqueItem.price;
      // } else {
      //     uniqueItem.inputItem.normal_prices[uniqueItem.floatIndex] = uniqueItem.price;
      // }
      console.error(`NEED IMPLEMENTATION`);
      // Filling necessary inromation
      itemWithFloat.float = uniqueItem.float;
      itemWithFloat.item = uniqueItem.inputItem;

      // Returning updated item
      return itemWithFloat;
    });

  for (let i = 0; i < allItemsForTradeupWithFloat.length; i++) {
    postMessage(
      new WorkerResponse<unknown>({
        msg: `<div class="text-info">Starting [${i}]. Left <b class="text-danger">${combinationsLeft}/${totalCombinations}</b></div>`,
        isHTML: true,
        insertAtStart: true,
        progress: new TradeupSearchProgress(totalCombinations, totalCombinations - combinationsLeft),
      }),
      undefined
    );

    for (let j = 0; j < allItemsForTradeupWithFloat.length; j++) {
      --combinationsLeft;
      let currentTradeupItemsWithFloat = [];
      let tradeupSummary: TradeupSummary;

      // Adding input items to current trade up
      currentTradeupItemsWithFloat = [...itemsForCalculation];

      // If we are looking at the same item then taking 10x that item as tradeup input.
      // Other case is when user wants to use only one, single collection. Otherwise search will be done with two collections
      if (i === j || settings.useSingleCollection) {
        // NOTE: This is faster than new array and fill
        for (let k = 0; k < 10 - itemsForCalculation.length; k++) {
          currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[i]);
        }

        // Calculating tradeup and getting summary
        tradeupSummary = calculateTradeUp(currentTradeupItemsWithFloat, settings.stattrak, structCollections);
        addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);
      } else {
        // i:j
        // 1:9
        currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[i]);
        for (let k = 0; k < 9 - itemsForCalculation.length; k++) {
          currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[j]);
        }
        // Calculating tradeup and getting summary
        tradeupSummary = calculateTradeUp(currentTradeupItemsWithFloat, settings.stattrak, structCollections);
        addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);

        // 2:8
        // Adding input items to current trade up
        currentTradeupItemsWithFloat = [...itemsForCalculation];
        for (let k = 0; k < 2; k++) {
          currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[i]);
        }
        for (let k = 0; k < 8 - itemsForCalculation.length; k++) {
          currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[j]);
        }
        // Calculating tradeup and getting summary
        tradeupSummary = calculateTradeUp(currentTradeupItemsWithFloat, settings.stattrak, structCollections);
        addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);

        // 3:7
        // Adding input items to current trade up
        currentTradeupItemsWithFloat = [...itemsForCalculation];

        for (let k = 0; k < 3; k++) {
          currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[i]);
        }
        for (let k = 0; k < 7 - itemsForCalculation.length; k++) {
          currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[j]);
        }
        tradeupSummary = calculateTradeUp(currentTradeupItemsWithFloat, settings.stattrak, structCollections);
        addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);

        // 4:6
        // Adding input items to current trade up
        currentTradeupItemsWithFloat = [...itemsForCalculation];
        for (let k = 0; k < 4; k++) {
          currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[i]);
        }
        for (let k = 0; k < 6 - itemsForCalculation.length; k++) {
          currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[j]);
        }
        tradeupSummary = calculateTradeUp(currentTradeupItemsWithFloat, settings.stattrak, structCollections);
        addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);

        // 5:5
        // Adding input items to current trade up
        currentTradeupItemsWithFloat = [...itemsForCalculation];
        for (let k = 0; k < 5; k++) {
          currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[i]);
        }
        for (let k = 0; k < 5 - itemsForCalculation.length; k++) {
          currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[j]);
        }

        tradeupSummary = calculateTradeUp(currentTradeupItemsWithFloat, settings.stattrak, structCollections);
        addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);
      }
    }
  }

  return bestTradeups;
}

function compareItems(bestTradeupItems: any, tradeupItemsToCompare: any): boolean {
  bestTradeupItems = bestTradeupItems.slice();
  tradeupItemsToCompare = tradeupItemsToCompare.slice();

  for (let i = bestTradeupItems.length - 1; i >= 0; i--) {
    let found = false;

    for (let j = 0; j < tradeupItemsToCompare.length; j++) {
      if (
        !found &&
        bestTradeupItems[i].item.name === tradeupItemsToCompare[j].item.name &&
        getFloatIndexForPrice(bestTradeupItems[i].float) === getFloatIndexForPrice(tradeupItemsToCompare[j].float)
      ) {
        found = true;
        bestTradeupItems.splice(i, 1);
        tradeupItemsToCompare.splice(j, 1);
      }
    }
  }
  if (bestTradeupItems.length === 0) {
    return true;
  }
  return false;
}

function addTradeupToFoundList(
  tradeupItems: TradeupItemWithFloat[],
  tradeupSummary: TradeupSummary,
  bestTradeups: BestTradeup[]
) {
  // Checking if tradeup is profitable enough to be added
  if (bestTradeups.length < 10 || tradeupSummary.profitPercentage > bestTradeups[9].tradeupSummary.profitPercentage) {
    // Taking only profitable tradeups (profit > 4%)
    if (tradeupSummary.profitPercentage > 0.04) {
      postMessage(
        new WorkerResponse<unknown>({
          msg: `<div class="text-success">Found tradeup with profit: <b>${(
            tradeupSummary.profitPercentage * 100
          ).toFixed(2)}%</b>.
    Profit: <b>${tradeupSummary.profit.toFixed(2)}</b>. Prize after Steam Tax: ${tradeupSummary.profitPrizeWithoutSteamTAX
            }
    </div>`,
          isHTML: true,
          insertAtStart: true,
        }),
        undefined
      );

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < bestTradeups.length; i++) {
        const currBestTradeupItems = bestTradeups[i].items;
        const result = compareItems(currBestTradeupItems, tradeupItems);

        if (result) {
          return;
        }
      }

      // Adding current tradeup to best tradeup list
      // best.push([tradeupItems, tradeupSummary]);
      bestTradeups.push({ items: tradeupItems, tradeupSummary });

      bestTradeups.sort((a: BestTradeup, b: BestTradeup) => {
        return b.tradeupSummary.profitPercentage - a.tradeupSummary.profitPercentage;
      });

      if (bestTradeups.length > settings.maxTradeups) {
        bestTradeups.pop();
      }
    }
  }
}

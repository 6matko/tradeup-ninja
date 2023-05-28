// import * as combinatorics from 'js-combinatorics';
import { Collection, Weapon } from '@server/items';
import { getAverageFloat, getOutcomes } from './tradeup-search.utils';
import {
  getFloatIndexForPrice,
  getInputItemFloatByCondition,
  getPrice,
  msToMinutesSeconds
} from './tradeup-shared-utils';
// tslint:disable-next-line:max-line-length
import {
  BestTradeup,
  DataObj,
  ItemSearchOptions,
  OutcomeSummary,
  StructuredCollectionWithItems,
  StucturedItemsByRarity,
  TradeupCalculation,
  TradeupItemWithFloat,
  TradeupOutcome,
  TradeupSearchProgress,
  TradeupSearchSettings,
  TradeupSummary,
  WorkerResponse
} from './tradeup.model';

/// <reference lib="webworker" />

// let collections: any[] = [];
let structCollections: StructuredCollectionWithItems[] = [];
const structByRarity: StucturedItemsByRarity = new StucturedItemsByRarity();
let settings: TradeupSearchSettings;
addEventListener('message', (evt) => {
  // Init
  const data = evt.data as DataObj;
  // Saving settings
  settings = data.settings;
  // Storing struct collections
  structCollections = data.structCollections;

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

      // collections = data.items.collections;
      const keys = Object.keys(data.items.weapons);
      keys.forEach((key) => {
        // Storing skin (weapon) for quick access
        const skin = data.items.weapons[key] as Weapon;

        // Structurizing skin by rarity
        structurizeItemByRarity(skin);
      });

      calculateAvgPrices();

      const bestTradeups = searchTradeups(settings.rarity);
      const endTime = performance.now();

      const responseDTO: WorkerResponse<any> = {
        // tslint:disable-next-line:max-line-length
        msg: `<div class="font-weight-bold text-dark">Operation completed in <span class="text-danger">${msToMinutesSeconds(
          endTime - startTime
        )} seconds</span></div>`,
        isHTML: true,
        data: { structByRarity, bestTradeups },
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

function structurizeItemByRarity(skin: Weapon) {
  if (!structByRarity[skin.rarity.value]) {
    structByRarity[skin.rarity.value] = [skin];
  } else {
    structByRarity[skin.rarity.value].push(skin);
  }
}

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

function calculateAvgPrices() {
  structCollections.forEach((col) => {
    const rarityKeys = Object.keys(col.items);
    rarityKeys.forEach((key) => {
      col.items[key].avgPricesNormal = calculateAvgPricesByWear(col.items[key].skins);
      col.items[key].avgPricesST = calculateAvgPricesByWear(col.items[key].skins, true);
    });
  });
}

function handleNullPricesForCheapestItems(cheapestItems: Weapon[]) {
  // Walking through every cheap item and checking if they have price
  cheapestItems.forEach((item, i) => {
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

function getCheapestItemsFromEachCollection(options: ItemSearchOptions) {
  // List with array of cheapest items for each collection grouped by wear (FN to BS)
  const cheapestItemsFromEachCollection: Weapon[][] = [];

  // Getting available collections for search based on excluded/included collections
  const collectionsToSearch = getAvailableCollectionsForSearch(options.excludeCollections, options.includeCollections);

  // Getting cheapest items for each collection
  collectionsToSearch.forEach((col) => {
    // Initializing array with cheapest items and filling it with nulls because
    // those nulls will be overwritten by cheapest items
    const cheapestItems: Weapon[] = new Array(5).fill(null);

    // Getting collection skins for specific rarity.
    // NOTE: Taking only those skins that are not excluded
    const collectionSkins = col.items[options.rarity]?.skins.filter(
      (skin) => !options.excludedSkins.includes(skin.name)
    );
    const hasCollectionNextItems = !!col.items[options.rarity + 1];
    // Checking if theree are skins for current collection in specific rarity
    // and if there are next rarity items for this collection
    if (collectionSkins && hasCollectionNextItems) {
      collectionSkins.forEach((skin) => {
        const skinPriceArray = settings.stattrak ? skin.price.stattrak : skin.price.normal;
        const skinVolumeArray = settings.stattrak ? skin.volume.stattrak : skin.volume.normal;

        for (let i = 0; i < cheapestItems.length; i++) {
          // Stroing reference to current cheap item for quick access
          const cheapItem = cheapestItems[i];
          const cheapItemPriceArray = settings.stattrak ? cheapItem?.price?.stattrak : cheapItem?.price?.normal;

          // If we yet don't have a cheap item then checking if current skin has price for current wear
          // and if it does then setting it as cheapest skin. In next iterations we will compare them
          // NOTE: Checking if current skin volume is greater or equal to minimal volume. Otherwise we are not interested in it
          if (
            !cheapItem &&
            skinPriceArray &&
            skinPriceArray[i] >= options.minVolume &&
            skinVolumeArray &&
            skinVolumeArray[i]
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
                skinPriceArray &&
                skinPriceArray[i] >= options.minVolume &&
                skinVolumeArray &&
                skinVolumeArray[i]) ||
              (cheapItem &&
                skinPriceArray &&
                skinPriceArray[i] >= options.minVolume &&
                skinVolumeArray &&
                skinVolumeArray[i] &&
                skinVolumeArray[i] < cheapItemPriceArray[i])
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


/**
 * Method gets list with items for trade up with float value from provided collections
 *
 * @param {Weapon[][]} cheapestSkinsFromEachCollection List with cheapest skins from each collection. Items from every collection
 * will be added to resulting array which contains also float values for each item
 * @returns {TradeupItemWithFloat[]} Returns items with float for trade up
 */
function getItemsForTradeupWithFloat(cheapestSkinsFromEachCollection: Weapon[][]): TradeupItemWithFloat[] {
  // Creating empty list with items for tradeup that will be filled
  const itemsForTradeupWithFloat: TradeupItemWithFloat[] = [];
  // Walking through each cheap item in collection and adding those items to list with available items for tradeup
  // including floats. We are creating item with appropriate float
  cheapestSkinsFromEachCollection.forEach((collectionWithSkins) => {
    collectionWithSkins.forEach((skin, i) => {
      if (skin) {
        itemsForTradeupWithFloat.push({
          item: skin,
          float: getInputItemFloatByCondition(i, skin, settings.difficulty),
        });
      }
    });
  });
  // Returning filled list with items for tradeup with float values
  return itemsForTradeupWithFloat;
}

function searchTradeups(rarity: number) {
  // Getting cheapest items from each collection
  const cheapestSkinsFromEachCollection: Weapon[][] = getCheapestItemsFromEachCollection({
    rarity,
    minVolume: settings.minVolume,
    excludeCollections: settings.excludedCollections,
    includeCollections: settings.includedCollections,
    excludedSkins: settings.excludedSkins,
  });
  let allItemsForTradeupWithFloat: TradeupItemWithFloat[] = [];

  // Initializing list with items for tradeup from primary collection
  let primaryCollectionItemsForTradeupWithFloat: TradeupItemWithFloat[] = [];

  // If primary collection is selected then setting everything up
  if (settings.primaryCollection) {
    // Getting cheapest skins for tradeup from primary collection
    const cheapestSkinsFromPrimaryCollection: Weapon[][] = getCheapestItemsFromEachCollection({
      rarity,
      minVolume: settings.minVolume,
      excludeCollections: settings.excludedCollections,
      includeCollections: [settings.primaryCollection],
      excludedSkins: settings.excludedSkins,
    });

    // If we have cheapest skins then getting items for tradeup with float values
    if (cheapestSkinsFromPrimaryCollection.length) {
      primaryCollectionItemsForTradeupWithFloat = getItemsForTradeupWithFloat(cheapestSkinsFromPrimaryCollection);
    }
  }

  // Getting list with all items for tradeup from each collection
  allItemsForTradeupWithFloat = getItemsForTradeupWithFloat(cheapestSkinsFromEachCollection);

  // const selectedInventoryItems = getSkinsFromInventoryItems(settings.skinsFromInventory, structByRarity[settings.rarity]);
  // console.log(selectedInventoryItems.length);

  // Initializing list with best tradeups found
  const bestTradeups = findBestCombinations(allItemsForTradeupWithFloat, primaryCollectionItemsForTradeupWithFloat);
  return bestTradeups;
}

// function searchForCombinationsWithInventoryItems(selectedInventoryItems: TradeupItemWithFloat[]) {
//   const bestTradeups = [];

//   // Setting up some informative variables like combination count (will be used as visual counter)
//   // const totalCombinations = 100000000000; //Math.pow(selectedInventoryItems.length, 2);
//   // let combinationsLeft = totalCombinations;

//   const it = new combinatorics.Combination(selectedInventoryItems, 10);
//   const totalCombinations = it.length as any; //Math.pow(selectedInventoryItems.length, 2);
//   let combinationsLeft = totalCombinations;

//   postMessage(new WorkerResponse<unknown>({
//     msg: `<div>Items available for tradeup: <b>${selectedInventoryItems.length}</b>. Total combinations: ${totalCombinations}</div>`,
//     isHTML: true,
//     sticky: true,
//   }), undefined);

//   const combinationArray = [...it];
//   // tslint:disable-next-line:one-variable-per-declaration
//   var i = 0, len = combinationArray.length;
//   while (i < len) {
//     combinationsLeft--;
//     postMessage(new WorkerResponse<unknown>({
//       msg: `<div class="text-info">Starting [${i}]. Left <b class="text-danger">${combinationsLeft}/${totalCombinations}</b></div>`,
//       isHTML: true,
//       insertAtStart: true,
//       progress: new TradeupSearchProgress(totalCombinations, totalCombinations - combinationsLeft),
//     }), undefined);

//     // Calculating tradeup and getting summary
//     const tradeupSummary = calculateTradeUpTEMPORARY(combinationArray[i]);

//     console.log(`EV: ${tradeupSummary.expectedValue} | Profit: ${tradeupSummary.profitPercentage}%`);

//     addTradeupToFoundList(combinationArray[i], tradeupSummary, bestTradeups);
//     // your code
//     i++;
//   }
//   return bestTradeups;
// }

function findBestCombinations(
  allItemsForTradeupWithFloat: TradeupItemWithFloat[],
  primaryCollectionItemsForTradeupWithFloat: TradeupItemWithFloat[],
  selectedInventoryItems?: TradeupItemWithFloat[]
) {
  const bestTradeups: BestTradeup[] = [];

  if (false && settings.onlyInventory) {
    // bestTradeups = searchForCombinationsWithInventoryItems(selectedInventoryItems);
  } else {
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

    // Setting primary list with items for tradeup search. If we have items for primary collection
    // then using those. Otherwise we have to take all items and make a regular two collection search
    const primaryItemsWithInput = primaryCollectionItemsForTradeupWithFloat.length
      ? [...primaryCollectionItemsForTradeupWithFloat]
      : [...allItemsForTradeupWithFloat];

    // selectedInventoryItems.forEach(item => item.usedInSearch = true);

    // primaryItemsWithInput.push(...selectedInventoryItems);

    for (let i = 0; i < primaryItemsWithInput.length; i++) {
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

        // If we are looking at the same item then taking 10x that item as tradeup input.
        // Other case is when user wants to use only one, single collection. Otherwise search will be done with two collections
        if (i === j || settings.useSingleCollection) {
          // NOTE: This is faster than new array and fill
          for (let k = 0; k < 10; k++) {
            currentTradeupItemsWithFloat.push(primaryItemsWithInput[i]);
          }

          // Calculating tradeup and getting summary
          tradeupSummary = calculateTradeUpTEMPORARY(currentTradeupItemsWithFloat);

          addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);
        } else {
          // i:j
          currentTradeupItemsWithFloat.push(primaryItemsWithInput[i]);
          for (let k = 0; k < 9; k++) {
            currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[j]);
          }

          // Calculating tradeup and getting summary
          tradeupSummary = calculateTradeUpTEMPORARY(currentTradeupItemsWithFloat);
          // if (bestTradeups.length < 10 || tradeupSummary.profitPercentage > bestTradeups[9].tradeupSummary.profitPercentage) {
          addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);
          // }
          currentTradeupItemsWithFloat = [];
          // 1:9
          for (let k = 0; k < 2; k++) {
            currentTradeupItemsWithFloat.push(primaryItemsWithInput[i]);
          }
          for (let k = 0; k < 8; k++) {
            currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[j]);
          }

          // Calculating tradeup and getting summary
          tradeupSummary = calculateTradeUpTEMPORARY(currentTradeupItemsWithFloat);
          // if (bestTradeups.length < 10 || tradeupSummary.profitPercentage > bestTradeups[9].tradeupSummary.profitPercentage) {
          addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);
          // }
          currentTradeupItemsWithFloat = [];
          // 2:8
          for (let k = 0; k < 3; k++) {
            currentTradeupItemsWithFloat.push(primaryItemsWithInput[i]);
          }
          for (let k = 0; k < 7; k++) {
            currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[j]);
          }
          // tradeup = new TradeUp(current);
          tradeupSummary = calculateTradeUpTEMPORARY(currentTradeupItemsWithFloat);
          // if (bestTradeups.length < 10 || tradeupSummary.profitPercentage > bestTradeups[9].tradeupSummary.profitPercentage) {
          addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);
          // }
          currentTradeupItemsWithFloat = [];
          // 3:7
          for (let k = 0; k < 4; k++) {
            currentTradeupItemsWithFloat.push(primaryItemsWithInput[i]);
          }
          for (let k = 0; k < 6; k++) {
            currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[j]);
          }
          // tradeup = new TradeUp(current);
          tradeupSummary = calculateTradeUpTEMPORARY(currentTradeupItemsWithFloat);
          // if (bestTradeups.length < 10 || tradeupSummary.profitPercentage > bestTradeups[9].tradeupSummary.profitPercentage) {
          addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);
          // }
          currentTradeupItemsWithFloat = [];
          // 4:6
          for (let k = 0; k < 5; k++) {
            currentTradeupItemsWithFloat.push(primaryItemsWithInput[i]);
          }
          for (let k = 0; k < 5; k++) {
            currentTradeupItemsWithFloat.push(allItemsForTradeupWithFloat[j]);
          }

          tradeupSummary = calculateTradeUpTEMPORARY(currentTradeupItemsWithFloat);
          // if (bestTradeups.length < 10 || tradeupSummary.profitPercentage > bestTradeups[9].tradeupSummary.profitPercentage) {
          addTradeupToFoundList(currentTradeupItemsWithFloat, tradeupSummary, bestTradeups);
          // }
        }
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
    // Taking only profitable tradeups (profit > min EV Percent). Min EV Percent is
    // whole number so we are dividing it by 100. For example 4 will become 0.04
    const validTradeupCondition =
      tradeupSummary.profitPercentage > settings.minEVPercent / 100 &&
      // Also taking into consideration that success odds are in users range
      tradeupSummary.outcomeSummary.successOdds >= settings.minSuccess / 100 &&
      tradeupSummary.outcomeSummary.successOdds <= settings.maxSuccess / 100;
    if (validTradeupCondition) {
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

/**
 * TEMPORARY tradeup calculation. NEeds to be refactored and used single method.
 * Method in tradeup-search.utils doesn't have check for maxCost
 *
 * @param {TradeupItemWithFloat[]} items
 * @returns {TradeupSummary}
 */
function calculateTradeUpTEMPORARY(items: TradeupItemWithFloat[]): TradeupSummary {
  // Initializing tradeup calculation
  const tradeupCalculation = new TradeupCalculation();

  // Getting outcomes for items in tradeup
  const outcomes: TradeupOutcome[] = getOutcomes(items, structCollections);

  for (const item of items) {
    // Getting price of each individual item (SCM price)
    const itemPrice = getPrice(item.item, item.float, settings.stattrak);

    if (!itemPrice) {
      return new TradeupSummary();
    }
    tradeupCalculation.totalCost += itemPrice;
  }

  if (tradeupCalculation.totalCost > settings.maxCost) {
    return new TradeupSummary();
  }

  let expectedValue = 0;
  for (const outcome of outcomes) {
    // Getting price of outcome item (Without tax)
    const price = getPrice(outcome.item, outcome.float, settings.stattrak, true);
    if (!price) {
      return new TradeupSummary();
    }
    // Checking if curreent item is best possible
    if (price > tradeupCalculation.mostExpensivePrize) {
      tradeupCalculation.mostExpensiveOutcomeItem = outcome.item;
      tradeupCalculation.mostExpensivePrize = price;
      tradeupCalculation.mostExpensiveChance = outcome.odds;
      tradeupCalculation.mostExpensiveItemFloat = outcome.float;
    }
    if (price < tradeupCalculation.cheapestPrize) {
      tradeupCalculation.cheapestOutcomeItem = outcome.item;
      tradeupCalculation.cheapestPrize = price;
      tradeupCalculation.cheapestChance = outcome.odds;
      tradeupCalculation.cheapestItemFloat = outcome.float;
    }
    expectedValue += price * outcome.odds;
    // Summing up prices of all outcome items to get expected value at later
    tradeupCalculation.total += price;
  }

  // Getting tradeup summary
  const tradeupSummary = new TradeupSummary(tradeupCalculation, expectedValue);
  // Storing average float of all input items
  tradeupSummary.averageFloat = getAverageFloat(items);
  // Initializing outcome summary
  const outcomeSummary = new OutcomeSummary(tradeupSummary, outcomes, settings.stattrak, settings.compareWithoutTax);
  // Assigning outcome summary to tradeup summary
  tradeupSummary.outcomeSummary = outcomeSummary;
  return tradeupSummary;
}

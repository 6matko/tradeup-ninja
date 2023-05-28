// tslint:disable-next-line:max-line-length
import { Collection, RootObject, Weapon } from '@server/items';
import * as _ from 'lodash';

import { getPrice } from './tradeup-shared-utils';
// tslint:disable-next-line:max-line-length
import {
  CollectionItemWithInfo,
  OutcomeSummary,
  StructuredCollectionWithItems,
  TradeupCalculation,
  TradeupItemWithFloat,
  TradeupOutcome,
  TradeupSummary,
} from './tradeup.model';

export function getItemOutput(
  itemWithFloat: TradeupItemWithFloat,
  avgFloat: number,
  structCollections: StructuredCollectionWithItems[]
): TradeupItemWithFloat[] {
  const itemCollection = structCollections.find((col) => col.collection.key === itemWithFloat.item.collection.key);
  const nextRarity = itemCollection.items[itemWithFloat.item.rarity.value + 1];
  const outcome: TradeupItemWithFloat[] = [];

  if (nextRarity) {
    nextRarity.skins.map((outputItem) => {
      outcome.push({
        item: outputItem,
        float: getOutcomeFloat(avgFloat, outputItem.min, outputItem.max),
      });
    });

    return outcome;
  }
}

/**
 * Method calculates average float of provided tradeup input items
 *
 * @export
 * @param {TradeupItemWithFloat[]} items List with tradeup input items
 * @returns {number} Returns average float
 */
export function getAverageFloat(items: TradeupItemWithFloat[]): number {
  const avgFloat = _.meanBy(items, 'float');
  return avgFloat;
}

export function getOutcomeFloat(avgFloat: number, min: number, max: number) {
  const returnfloat = avgFloat * (max - min) + min;
  return returnfloat;
}

/**
 * Method calculates chance for outcome based on outcome item count (chance) in comparsion to all outcome chance
 *
 * @param {number} outcomeItemCount Amount of item outcome count.
 * If only 1 item with 2 outcomes is added to tradeup then this will be 1 * 2 = 2 (outcome chances)
 * @param {number} totalOutcomeCount Total amount of all possible outcome counts
 * @returns {number} Returns numeric value of chance percentage in format (0.1512) = 15.12%
 */
export function calculateOutcomeChance(outcomeItemCount: number, totalOutcomeCount: number): number {
  return +(outcomeItemCount / totalOutcomeCount).toFixed(4);
}

export function getOutcomes(
  items: TradeupItemWithFloat[],
  structCollections: StructuredCollectionWithItems[]
): TradeupOutcome[] {
  const allOutputs: TradeupItemWithFloat[] = [];
  const avgFloat = getAverageFloat(items);

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < items.length; i++) {
    const outputItems = getItemOutput(items[i], avgFloat, structCollections);
    // TODO: Figure out why outputItems may be undefined
    if (outputItems) {
      // Adding output items to
      allOutputs.push(...outputItems);
    }
    // skins = skins.concat(items[i].item.getTradeupSkins(avgFloat));
  }

  const outputArray: TradeupOutcome[] = [];

  for (const outputItem of allOutputs) {
    const itemInResultingOutputArray = outputArray.find(
      (item) =>
        // Making sure that both item name and their variations are the same. This is mostly
        // for Glock Gamma Doppler case where one skin can be in different variations
        item.item.name === outputItem.item.name &&
        item.item.variation === outputItem.item.variation &&
        item.float === outputItem.float
    );

    if (itemInResultingOutputArray) {
      itemInResultingOutputArray.outputCount++;
    } else {
      outputArray.push(Object.assign({ outputCount: 1, odds: 0 }, outputItem));
    }
  }

  const totalOutcomeChance = outputArray.reduce((prev, curr) => prev + curr.outputCount, 0);

  // Adding odds for each specific outcome
  outputArray.map((outcome) => {
    const outcomeChance = calculateOutcomeChance(outcome.outputCount, totalOutcomeChance);
    outcome.odds = outcomeChance;
    return outcome;
  });

  return outputArray;
}

/**
 * Method calculatess trade up summary
 *
 * @export
 * @param {TradeupItemWithFloat[]} items Input items for trade up
 * @param {boolean} [stattrak=false] Is it Stattrak trade up or for normal weapon
 * @param {StructuredCollectionWithItems[]} structCollections List with structurized collections with items (Used to get outcomes)
 * @param {boolean} [withoutSteamTax=true] Indicates if outcome item prices should be taken Without steam tax. By default `true` (without steam tax)
 * @returns {TradeupSummary} Returns calculated trade up summary
 */
export function calculateTradeUp(
  items: TradeupItemWithFloat[],
  stattrak: boolean = false,
  structCollections: StructuredCollectionWithItems[],
  withoutSteamTax: boolean = true,
  ignoreEmptyPrice: boolean = false,
  customOutcome?: TradeupOutcome
): TradeupSummary {
  // Initializing tradeup calculation
  const tradeupCalculation = new TradeupCalculation();

  // Getting outcomes for items in tradeup
  const outcomes: TradeupOutcome[] = getOutcomes(items, structCollections);

  for (const item of items) {
    // Getting price of each individual item (SCM price)
    const itemPrice = getPrice(item.item, item.float, stattrak);

    // Only if price is not provided and not "0" we create new tradeup and return it
    // because otherwise there is no price
    if (itemPrice !== 0 && !itemPrice) {
      return new TradeupSummary();
    }
    tradeupCalculation.totalCost += itemPrice;
  }

  let expectedValue = 0;
  for (const outcome of outcomes) {
    // If we have custom outcome and it matches current outcome
    // then updating it (NOTE: Including variation into consideration to make it more accurate)
    if (outcome.item.name === customOutcome?.item.name && outcome.item.variation === customOutcome?.item.variation) {
      // Replacing current outcome item with updated aka custom
      outcome.item = customOutcome.item;
    }

    // Getting price of outcome item (Based on if we need to get it with or without steam tax)
    let price = getPrice(outcome.item, outcome.float, stattrak, withoutSteamTax);
    if (!price) {
      // If empty price should be ignored thn setting it as "0" and treat it as special case.
      // Probably this price will get overriden
      if (ignoreEmptyPrice) {
        price = 0;

        // Setting most expensive prize details as special case
        // beacause due price = 0 it can be both most expensive and cheapest item.
        // NOTE: Doing it only if we didn't set any before
        if (!tradeupCalculation.mostExpensivePrize) {
          setMostExpensivePrize(tradeupCalculation, outcome, price);
        }

        // Setting flag that this item doesn't have SCM price
        outcome.item.noSCMPrice = true;
      } else {
        return new TradeupSummary();
      }
    }
    // Checking if curreent item is best possible
    if (price > tradeupCalculation.mostExpensivePrize) {
      // Setting most expensive prize details
      setMostExpensivePrize(tradeupCalculation, outcome, price);
    }
    if (price < tradeupCalculation.cheapestPrize) {
      // Setting cheapest prize
      setCheapestPrize(tradeupCalculation, outcome, price);
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
  const outcomeSummary = new OutcomeSummary(tradeupSummary, outcomes, stattrak, true);
  // Assigning outcome summary to tradeup summary
  tradeupSummary.outcomeSummary = outcomeSummary;
  return tradeupSummary;
}

/**
 * Method sets necessary properties with values for most expensive outcome
 *
 * @param {TradeupCalculation} tradeupCalculation Tradeup calculation details. All values will be set on this object
 * @param {TradeupOutcome} outcome Most expensive outcome item details
 * @param {number} price Outcome item price
 */
function setMostExpensivePrize(tradeupCalculation: TradeupCalculation, outcome: TradeupOutcome, price: number) {
  tradeupCalculation.mostExpensiveOutcomeItem = outcome.item;
  tradeupCalculation.mostExpensivePrize = price;
  tradeupCalculation.mostExpensiveChance = outcome.odds;
  tradeupCalculation.mostExpensiveItemFloat = outcome.float;
}

/**
 * Method sets necessary properties with values for cheapest outcome
 *
 * @param {TradeupCalculation} tradeupCalculation Tradeup calculation details. All values will be set on this object
 * @param {TradeupOutcome} outcome Cheapest outcome item details
 * @param {number} price Outcome item price
 */
function setCheapestPrize(tradeupCalculation: TradeupCalculation, outcome: TradeupOutcome, price: number) {
  tradeupCalculation.cheapestOutcomeItem = outcome.item;
  tradeupCalculation.cheapestPrize = price;
  tradeupCalculation.cheapestChance = outcome.odds;
  tradeupCalculation.cheapestItemFloat = outcome.float;
}

export function addNewCollection(collection: Collection, skinWeapon: Weapon) {
  const newCollection: StructuredCollectionWithItems = {} as any;
  const skinRarityString = skinWeapon.rarity.value.toString();
  newCollection[skinRarityString] = {
    collection,
    items: {},
  };
  newCollection[skinRarityString].items[skinRarityString] = {};
  newCollection[skinRarityString].items[skinRarityString]['skins'] = [skinWeapon];

  return newCollection[skinRarityString];
}

export function structurizeItemByCollection(rootObj: RootObject) {
  const resultArray: StructuredCollectionWithItems[] = [];

  // Walking through each collection because it contains all skins related to it.
  // With this logic we are structurizing them by rarity within collection
  Object.values(rootObj.collectionsWithSkins).forEach((col) => {
    // Quick ref to current collection
    const collection = rootObj.collectionsWithSkins[col.key];
    collection?.items?.forEach((skin) => {
      // Creating new object to avoid references.
      // NOTE: Old solution that allowed custom price setting in calculator and then these prices
      // would reflect in search as well (because price array doesn't get updated)
      // const weaponSkin = Object.assign({}, rootObj.weapons[skin.fullName]);

      // Quick fix for issue when new collection is released
      // but weapons array for some reason doesn't know anything about this skin
      if (!rootObj.weapons[skin.fullName]) {
        return;
      }

      // NOTE: This fixes the issue of price references but also breaks feature of setting
      // custom prices that reflect in search
      // FIXME: Get rid of lodash and use "structuredClone"
      const weaponSkin = _.cloneDeep(rootObj.weapons[skin.fullName]);

      // Setting skin variation if its present
      weaponSkin.variation = skin?.variation;

      // Searching for existing collection to put new skin into it
      const foundSkinCollection =
        resultArray.length && resultArray.find((resultCol) => resultCol.collection.key === col.key);
      // If collection was not found then creating new one
      if (!foundSkinCollection) {
        resultArray.push(addNewCollection(collection, weaponSkin));
      } else {
        // Checking if we already have array with items for this specific rarity in this specific collection.
        // If so then adding current skin to this collection for specific rarity
        if (foundSkinCollection.items[skin.rarity.value]) {
          foundSkinCollection.items[skin.rarity.value].skins.push(weaponSkin);
          // If not then creating it as new array
        } else {
          foundSkinCollection.items[skin.rarity.value] = new CollectionItemWithInfo();
          foundSkinCollection.items[skin.rarity.value].skins = [weaponSkin];
        }
      }
    });
  });

  // Sorting array alphabetically by collection names
  resultArray.sort((a, b) => {
    if (a.collection.name < b.collection.name) {
      return -1;
    }
    if (a.collection.name > b.collection.name) {
      return 1;
    }
    return 0;
  });

  return resultArray;
}

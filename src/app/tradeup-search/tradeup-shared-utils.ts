import { Collection, RootObject, Weapon } from '@server/items';
import { ConditionForPriceDisplay } from '../input-overview/input-overview.model';
import { InventoryItem } from '../inventory/inventory.model';
import { FloatRange } from '../models/core.model';
import { CalculatorInputItem } from '../tradeup-calculator/tradeup-calculator.model';
import { InputItemsForDisplay } from './tradeup-display/tradeup-display.model';
import {
  StructuredCollectionWithItems,
  TradeupItemWithFloat,
  TradeupSearchSettings,
  WeaponRarity,
  WeaponWear
} from './tradeup.model';

export function getFloatIndexForPrice(float: number) {
  // If float is not provided then returning "-1" to indicate that we couldn't
  // get float index
  if (!float) {
    return -1;
  }
  // Fixing float to 7 decimals because otherwise calculations might be incorrect.
  // Initially picked "6" because for display we are displaying 7 decimals but there was an error with "0.0699996"...
  // ...this number was floating to 0.07 and FN skin was considered as MW
  // Example:
  // 0.6999999... for display will be 0.07 and actually should be threated as MW, not FN.
  // Without this fix price was taken for FN exterior and it was incorrect.
  // NOTE: Previously we were rounding to 2 decimals but then values like "0.0665" were rounded to "0.07"
  // and therefore threated as "MW" but actually it was still "FN"
  const fixedFloat = +float.toFixed(7);
  // Factory new
  if (fixedFloat < 0.07) {
    return 0;
    // Minimal wear
  } else if (fixedFloat < 0.15) {
    return 1;
    // Field tested
  } else if (fixedFloat < 0.38) {
    return 2;
    // Well worn
  } else if (fixedFloat < 0.45) {
    return 3;
    // Battle scarred
  } else {
    return 4;
  }
}

/**
 * Method geets price
 *
 * @export
 * @param {Weapon} item Skin to get price for
 * @param {number} float Skin float
 * @param {boolean} [isStattrak] Indicates if prices should be gotten for stattrak. By default `false`
 * @returns Returns numeric price based on float
 */
export function getPrice(item: Weapon, float: number, isStattrak?: boolean, withoutTax?: boolean) {
  const priceIndex = getFloatIndexForPrice(float);
  // If we couldn't get price index then returning price "-1" as special value
  // for this special case
  if (priceIndex === -1) {
    return -1;
  }

  let skinPrice = isStattrak ? item.price.stattrak[priceIndex] : item.price.normal[priceIndex];

  if (withoutTax) {
    skinPrice *= 0.87;
  }
  return skinPrice;
}

/**
 * Method converts rarity value to readable name
 *
 * @export
 * @param {number} rarity
 * @returns Returns human readable rarity name based on rarity value
 */
export function getRarityName(rarity: number) {
  switch (rarity) {
    case 1:
      return 'Consumer';
    case 2:
      return 'Industrial';
    case 3:
      return 'Mil-spec';
    case 4:
      return 'Restricted';
    case 5:
      return 'Classified';
    case 6:
      return 'Covert';
    default:
      return '???';
  }
}

/**
 * Method gets volume for specific item
 *
 * @export
 * @param {Weapon} item Skin to get price for
 * @param {number} float Skin float
 * @returns Returns numeric volume based on float
 */
export function getVolume(item: Weapon, float: number, isStattrak?: boolean) {
  const volumeIndex = getFloatIndexForPrice(float);
  return isStattrak ? item.volume.stattrak[volumeIndex] : item.volume.normal[volumeIndex];
}

/**
 * Method converts milliseconds to mm:ss (Minutes and seconds)
 *
 * @export
 * @param {number} ms Milliseconds
 * @returns {string} Returns time in format of "mm:ss" which represents minutes and seconds
 */
export function msToMinutesSeconds(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = +((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/**
 * Method creates list of all skins and returns it
 *
 * @export
 * @param {RootObject} rootObj Root object with weapons, skins and other stuff
 * @param {WeaponRarity} [rarity] Rarity value by which skins should be selected. If not passed then will take absolutely every
 * skin. Otherwise will take only those skins that match proviided rarity
 * @param {StructuredCollectionWithItems[]} [structCollections] Structured collections with skins. If this property is passed then
 * only those skins will be taken which have outcome
 * @returns {Weapon[]} Reeturns list with skins
 */
export function getAllSkins(
  rootObj: RootObject,
  stattrak?: boolean,
  rarity?: WeaponRarity,
  structCollections?: StructuredCollectionWithItems[]
): Weapon[] {
  const allSkins: Weapon[] = [];
  const keys = Object.keys(rootObj.weapons);

  keys.forEach((key) => {
    const weapon = rootObj.weapons[key];

    // If we need stattrak weapon and current weapon doesn't have stattrak
    // then skipping it (ignoring)
    if (stattrak && !weapon.stattrak) {
      return;
    }
    // If rarity is provided then checking if skin has the same rarity
    // as provided. Otherwise going to next iteration and therefore
    // ignoring current skin
    if (rarity && weapon.rarity.value !== rarity) {
      return;
    }

    // If structurized collections list is passed then taking only those weapons/skins that
    // have outcome (next rarity)
    if (structCollections?.length) {
      // Getting next rarity
      const nextRarity = structCollections.find((col) => col.collection.key === weapon.collection.key)?.items[
        rarity + 1
      ];
      // Ignoring skins that have no outcome aka next rarity
      if (!nextRarity?.skins?.length) {
        return;
      }
    }

    // Storing access to current skin (paint) for quick access
    // Using Object.assing to prevent refenrecing
    const skin = Object.assign({}, weapon);
    allSkins.push(skin);
  });
  return allSkins;
}

/**
 * Method returns information about specific collection by collection key
 *
 * @export
 * @param {string} collectionKey Key by which collection should be searched for
 * @param {Collection[]} collections List of all collections (From root obbject)
 * @returns {Collection} Returns found collection or `undefined` if nothing was found
 */
export function getCollection(collectionKey: string, collections: Collection[]): Collection {
  return collections.find((col) => col.key === collectionKey);
}

/**
 * Method gets random key for items with weight (odds)
 *
 * @export
 * @param {*} prob Probabilities. Should be like this: `{key:weight, key: weight}`.
 * Example: `{0:0.25,'abc':0.75}`. Max weight cannot be more than 1
 * @returns Returns random key
 */
export function weightedRandom(prob: any): unknown {
  // Src: https://redstapler.co/javascript-weighted-random/
  // Src: https://stackoverflow.com/questions/8435183/generate-a-weighted-random-number
  let sum = 0;
  // Random number
  const rand = Math.random();
  for (const key in prob) {
    if (prob.hasOwnProperty(key)) {
      sum += prob[key];
      if (rand <= sum) {
        return key;
      }
    }
  }
}

/**
 * Method removes duplicated input items and counts them so we could have
 * list with distinct input items and `Amount` field which represents how many
 * of following input items are needed
 *
 * @private
 * @param {TradeupItemWithFloat[]} inputItems Input items that are used for tradeup
 * @returns {InputItemsForDisplay[]} Returns list with input items for tradeup that will be used for display purposes
 */
export function getDistinctInputItems(inputItems: TradeupItemWithFloat[]): InputItemsForDisplay[] {
  // Getting distinct items with amount field
  const distinct = inputItems.reduce((resultingArr: InputItemsForDisplay[], val) => {
    // Getting index of duplicate item (Name and most importantly FLOAT is identical)
    const indexOfDuplicate = resultingArr.findIndex(
      (arrayItem) => arrayItem.item.name === val.item.name && arrayItem.float === val.float
    );

    // Initializing new item if we didn't found it
    if (indexOfDuplicate === -1) {
      resultingArr.push({
        // Setting initial amount of current input item
        amount: 1,
        // Adding input item properties
        ...val,
      });
    } else {
      // Increasing amount of found item
      resultingArr[indexOfDuplicate].amount++;
    }
    // Returning resulting array with accumulated items
    return resultingArr;
  }, []);
  // Returning found distinct input items
  return distinct;
}

/**
 * Method creates and returns list with conditions for price display
 *
 * @private
 * @returns {ConditionForPriceDisplay[]} Returns list with conditions for price display
 */
export function getConditionsForPrices(): ConditionForPriceDisplay[] {
  // Returning list with conditions for price display
  return [
    // FN 0 - 0.07
    new ConditionForPriceDisplay('FN', 0.01),
    // MW 0.07 - 0.15
    new ConditionForPriceDisplay('MW', 0.08),
    // FT 0.15 - 0.38
    new ConditionForPriceDisplay('FT', 0.2),
    // WW 0.38 - 0.45
    new ConditionForPriceDisplay('WW', 0.4),
    // BS 0.45 - 1
    new ConditionForPriceDisplay('BS', 0.5),
  ];
}

/**
 * Method gets float value for tradeup input item for specific conditioin and based on skin range limitations
 *
 * @param {WeaponWear} conditionIndex Index of condition (0 - Factory new, 1 - Minimal Wear, etc...)
 * @param {Weapon} skin Information about skin. Needed for range limitations
 * @param {number} difficulty Difficulty. Used to calculate float that should be added
 * @returns {number} Returns float for input item based on difficulty from settin
 */
export function getInputItemFloatByCondition(conditionIndex: WeaponWear, skin: Weapon, difficulty: number): number {
  // Storing information about current range for quick access
  const currentRange = FloatRange[conditionIndex];
  // Checking if current skin has range limitations. If skin range limit is below current range
  // minimal value then taking current range min. Otherwise we are taking skin range limit
  const currentRangeMinimum = skin.min < currentRange.min ? currentRange.min : skin.min;
  // Checking if current skin has lower maximum range value than current range's max value. If so then
  // taking skin's max float range value. Otherwise we don't have no problem to use current range max value so
  // we are taking it instead
  const currentRangeMaximum = skin.max < currentRange.max ? skin.max : currentRange.max;
  // Calculating amount of float to add for our input item float
  const addingValue = (currentRangeMaximum - currentRangeMinimum) * difficulty;
  const inputFloat = currentRangeMinimum + addingValue;

  // Returning input float
  return inputFloat;
}

/**
 * Method gets list with items for trade up with float value from provided collections
 *
 * @param {Weapon[][]} cheapestSkinsFromEachCollection List with cheapest skins from each collection. Items from every collection
 * will be added to resulting array which contains also float values for each item
 * @param {number} difficulty Tradeup difficulty. Used to calculate float that should be added
 * @returns {TradeupItemWithFloat[]} Returns items with float for trade up
 */
export function getItemsForTradeupWithFloat(
  cheapestSkinsFromEachCollection: Weapon[][],
  difficulty: number
): TradeupItemWithFloat[] {
  // Creating empty list with items for tradeup that will be filled
  const itemsForTradeupWithFloat: TradeupItemWithFloat[] = [];
  // Walking through each cheap item in collection and adding those items to list with available items for tradeup
  // including floats. We are creating item with appropriate float
  cheapestSkinsFromEachCollection.forEach((collectionWithSkins) => {
    collectionWithSkins.forEach((skin, i) => {
      if (skin) {
        itemsForTradeupWithFloat.push({ item: skin, float: getInputItemFloatByCondition(i, skin, difficulty) });
      }
    });
  });
  // Returning filled list with items for tradeup with float values
  return itemsForTradeupWithFloat;
}

/**
 * Method gets skin information and object based on inventory item. This methode is
 * needed for cases when we have `InventoryItem's` but in order for system to work correctly
 * we need them ass `Weapon` or similar objects and this method gets necessary object
 *
 * @export
 * @param {InventoryItem[]} inventoryItems List with items in inventory
 * @param {Weapon[]} allSkins List with all skins. Inventory items will be searched among this list
 * @returns
 */
export function getSkinsFromInventoryItems(inventoryItems: InventoryItem[], allSkins: Weapon[]) {
  const skinsFromInventory: TradeupItemWithFloat[] = [];
  inventoryItems.forEach((item) => {
    const foundSkin = allSkins.find((skin) => skin.name === `${item.weapon_type} | ${item.item_name}`);
    if (foundSkin) {
      skinsFromInventory.push({
        item: foundSkin,
        float: item.floatvalue,
      });
    }
  });
  return skinsFromInventory;
}

/**
 * Method gets valid items for display based on settings
 *
 * @export
 * @param {InventoryItem[]} inventoryItems
 * @param {Weapon[]} skinsForDisplay
 * @returns Returns skins for display
 */
export function getInventoryItemsForDisplay(
  inventoryItems: InventoryItem[],
  skinsForDisplay: Weapon[],
  itemsInCalculator: CalculatorInputItem[],
  settings: Partial<TradeupSearchSettings>
) {
  // Getting list of item IDs that are added to calculator. We will need them to compare if specific item is already
  // added and therefore not show it again
  const addedSkinItemIds = itemsInCalculator.filter((item) => item.inventoryItemId).map((item) => item.inventoryItemId);

  // Filtering items for current rarity and by stattrak property
  const matchingItems = inventoryItems
    .filter((item) => {
      const rarityMatch = item.rarity === settings.rarity;
      // Storing if item has stattrak. Via analyzing it was found that stattrak items have quality 9 and quality name "StatTrak™".
      // "item.stattrak" flag indicates if current item can be found in stattrak. In "false" then this item can not have stattrak at all
      const itemHasStattrak = item.quality === 9 || item.quality_name === 'StatTrak™';
      // Checking if current item has stattrak and it matches settings
      const stattrakMatch = itemHasStattrak === settings.stattrak;

      // Returning filtered item if rarity and stattrak conditions are met
      return rarityMatch && stattrakMatch;
    })
    // Filtering out already added items so user wouldn't select them again
    .filter((item) => !addedSkinItemIds.includes(item.floatid));
  // Converting our inventory items to skins to know which items have outcomes and which don't.
  // Additionally, we are using skins eligible for display, e.g. only those that have outcomes and can be used
  // so with this behavior we can achieve logic to filter out items that shouldn't be selectable (from inventory)
  const skinsFromInventory = getSkinsFromInventoryItems(matchingItems, skinsForDisplay);
  // Filtering only valid inventory items like those that have outcome (since we are using them for calculator)
  const validItems = matchingItems.filter((item) =>
    skinsFromInventory.find((skin) => skin.item.name === `${item.weapon_type} | ${item.item_name}`)
  );
  // Returning only those items (inventory items) that user can select (they have outcomes, for example)
  return validItems;
}

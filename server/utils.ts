import { indexOf } from 'lodash';
import { CollectionInfoWithSkin } from './core';
import { CsgoFloatWeapon, Paint } from './core/interfaces/csgofloat.interface';
import { CsgoTraderAppItem, SkinPriceDictionary } from './core/interfaces/csgoTraderApp.interface';
import { DecodedSkinInfo } from './core/interfaces/utils.interface';
import { Collection, CollectionsWithSkin, ICollectionWithSkins, ItemSync, Rarity, Weapon, Wear } from './items/items.model';
import { DOT_CHAR } from './items/items.service';
import { Prices } from './items/schemas/item.model';

export function objectKeysToLowerCase(obj: unknown): unknown {
  let key;
  const keys = Object.keys(obj);
  let n = keys.length;
  const newobj = {};
  while (n--) {
    key = keys[n];
    newobj[key.toLowerCase()] = obj[key];
  }
  return newobj;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getRarities(itemsGame: any, csgoEnglishTokens: any): Rarity[] {
  const result = [];
  // Walking through each rarity object
  for (const key in itemsGame.rarities) {
    if (itemsGame.rarities.hasOwnProperty(key)) {
      // Storing current rarity for quick access
      const currRarity = itemsGame.rarities[key];
      // Adding rarity to all rarities array (Resulting)
      result.push({
        // Converting rarity value to number (because it is string) and storing
        value: +currRarity.value,
        key,
        name: csgoEnglishTokens[currRarity.loc_key_weapon.toLowerCase()],
      });
    }
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getCollections(csgoEnglishTokens: any): Collection[] {
  const result = [];
  // Getting keys of csgo_english file Tokens
  const csgoEnglishKeys = Object.keys(csgoEnglishTokens);
  // Filtering collection keys. Excluding desc & agent collections
  const collectionKeys = csgoEnglishKeys.filter(
    (key) =>
      key.includes('csgo_set_') && !key.includes('_desc') && !key.includes('_short') && !key.includes('characters')
  );

  collectionKeys.forEach((colKey) => {
    // Removing 'CSGO_' prefix because we don't need it for actual key
    const keyWithoutPrefix = colKey.replace('csgo_', '');
    // Adding collection to all collection list
    result.push({
      key: keyWithoutPrefix,
      // Getting name of current collection (Using full key, including prefiix for that)
      name: csgoEnglishTokens[colKey.toLowerCase()],
    });
  });
  return result;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getWears(csgoEnglishTokens: any) {
  const result = [];
  // Get wear names
  for (let i = 0; i < 5; i++) {
    result.push(csgoEnglishTokens[('SFUI_InvTooltip_Wear_Amount_' + i).toLowerCase()]);
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getCollectionsByRarirtyWithSkinKeys(itemsGame: any) {
  // Getting collection keys
  const collectionKeys = Object.keys(itemsGame.item_sets);
  // Dictionary with collections and items in them by rarity
  const collectionsWithItemsByRarity = {};

  // Walking through each collection key
  for (const collectionKey of collectionKeys) {
    // Getting list of skin keys in current collection
    const itemSetItemKeys = Object.keys(itemsGame.item_sets[collectionKey].items);
    // Walking through all client loot list items in order to find items in those collections
    for (const clientLootListKey in itemsGame.client_loot_lists) {
      if (itemsGame.client_loot_lists.hasOwnProperty(clientLootListKey)) {
        // Storing current loot list item for quick access
        const currentLootListItem = itemsGame.client_loot_lists[clientLootListKey];
        // Walking through each item in current loot list
        for (const elementKey in currentLootListItem) {
          if (currentLootListItem.hasOwnProperty(elementKey)) {
            // Checking if current loot list contains skins that are from specific colllection.
            // Acting if we have found necessary loot list with same items that are in current collection
            if (itemSetItemKeys.includes(elementKey)) {
              // Splitting current loot list key to extract rarity (it is something like "crate_community_23_rare")
              const splitKey = clientLootListKey.split('_');
              // If we found appropriate key in loot list then rarity is usually
              // placed as last text, so we take it
              const currentRarityName = splitKey[splitKey.length - 1];
              // Creating empty object for this key (colllection key) if it didn't exist
              if (!collectionsWithItemsByRarity[collectionKey]) {
                collectionsWithItemsByRarity[collectionKey] = {};
              }
              // After we can create rarity for each individual collection.
              // That way we can create Dictionary with collection by rarities
              // and items in them. If rarity doesn't yet exist then we are initializing it with current
              // skinn key. Otherwise adding to other skin list
              if (!collectionsWithItemsByRarity[collectionKey][currentRarityName]) {
                collectionsWithItemsByRarity[collectionKey][currentRarityName] = [elementKey];
              } else {
                collectionsWithItemsByRarity[collectionKey][currentRarityName].push(elementKey);
              }
            }
          }
        }
      }
    }
  }
  // Returning generated Dictionary with collections that contain items sorted by rarities
  return collectionsWithItemsByRarity;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getSimpleCollectionInfo(collections: any[], collectionKey: string) {
  return collections.find((col) => col.key === collectionKey);
}

function getSkinData(itemsGame: any, csgoEnglishTokens: any, skinKey: string) {
  let foundSkin;
  for (const key in itemsGame.paint_kits) {
    if (itemsGame.paint_kits.hasOwnProperty(key)) {
      const element = itemsGame.paint_kits[key];
      if (element.name === skinKey) {
        // Original skin name
        const skinName = csgoEnglishTokens[element.description_tag.substr(1).toLowerCase()];
        // Skin name with variation (e.g. Emerald / Phase 1 / etc...)
        let skinVariation;
        // If current element (csgo item) has a family then it has phases and stuff like that.
        // In this case we are creating skin variation with unique variation so it would actually appear because
        // otherwise there will be single skin used. Example: There is a Glock | Gamma Doppler
        // which comes in with "Emerald" and "Phase 1 - 4" variations (total 5). Without this check
        // there was an issue where skin with name "Glock | Gamma Doppler" was found and all other variations
        // were ignored. With this logic it will be fixed
        if (element.same_name_family_aggregate) {
          skinVariation = getSkinVariationName(skinKey);
        }

        // If min float is not provided then taking default value
        if (!element.wear_remap_min) {
          element.wear_remap_min = itemsGame.paint_kits[0].wear_remap_min;
        }
        // If max float not proviided then taking default value
        if (!element.wear_remap_max) {
          element.wear_remap_max = itemsGame.paint_kits[0].wear_remap_max;
        }
        // Creating found skin object
        foundSkin = {
          name: skinName,
          variation: skinVariation,
          min: +element.wear_remap_min,
          max: +element.wear_remap_max,
        };
        break;
      }
    }
  }
  return foundSkin;
}

/**
 * Method gets variation of skin (Emerald or Phase for example)
 *
 * @param {string} skinNameInPaintKits Skin name that can be found in "paint_kits" (**am_emerald_marbleized_glock** for example)
 * @return {*}
 */
function getSkinVariationName(skinNameInPaintKits: string) {
  // Phase handling
  if (skinNameInPaintKits.includes('phase')) {
    // Splitting skin name into parts like ["am", "gamma", "doppler", "phase3"]
    const splittedSkinName = skinNameInPaintKits.split('_');
    // Getting part with "phase" and with split getting phase number ("phase3" will become "phase", "3").
    // And in the end returning "Phase 3" for example
    return `Phase ${splittedSkinName.find((x) => x.includes('phase')).split('phase')[1]}`;
  }

  // Emerald handling
  if (skinNameInPaintKits.includes('emerald')) {
    return 'Emerald';
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getRarityByKey(rarities: any[], rarityKey: string) {
  const rarity = rarities.find((rar) => rar.key === rarityKey);
  return rarity;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getCollectionsWithSkins(collections: Collection[], rarities: Rarity[], itemsGame: any, csgoEnglishTokens: any) {
  // Getting collections sorted by rarity and items in them (Skins are by key like "[gs_mp5_etch]weapon_mp5sd")
  const collectionsWithItemsByRarity = getCollectionsByRarirtyWithSkinKeys(itemsGame);
  // Creating Dictionary that will be resulting (all skins will be placed here)
  const collectionsWithSkins: { [key: string]: CollectionsWithSkin } = {};
  const weaponSkinFullNames: string[] = [];

  // Walking through each collection
  for (const key in collectionsWithItemsByRarity) {
    if (collectionsWithItemsByRarity.hasOwnProperty(key)) {
      // Storing current collection for quick access
      const currentCollection = collectionsWithItemsByRarity[key];

      // Initializing current collection
      collectionsWithSkins[key] = {
        // Getting all the basic information about collection
        ...getSimpleCollectionInfo(collections, key),
        // Adding items property that will contain all items in this collection
        items: [],
      };

      // Walking through each rarity of each individual collection to make
      // appropriate skin object and add it to resulting Dictionary
      for (const rarityKey in currentCollection) {
        if (currentCollection.hasOwnProperty(rarityKey)) {
          const currentCollectionRarity = currentCollection[rarityKey];
          currentCollectionRarity.forEach((skinKey) => {
            // Splitting set key into different parts. For example if its like this:
            // [cu_glock18_warmaiden]weapon_glock - it will beceome ['', 'cu_glock18_warmaiden', 'weapon_glock']
            // And since we don't need first (empty) element, we take only what we need (['cu_glock18_warmaiden', 'weapon_glock'])
            const splitNames = skinKey.split(/\[(.*?)\]/).splice(1, 2);
            // If we weren't able to split name then its some extra case (Like Agent skin for example) and
            // therefore we don't do anything. Just skipping
            if (!splitNames.length) {
              return;
            }
            // Getting token for weapon name. Weapon names are stored in prefabs (item_name) property.
            // Since item name contains '#' as first character, we need to remove it and afterwards will get
            // something like this 'SFUI_WPNHUD_M4A1' - We can get weapon name by this token
            const prefab = itemsGame.prefabs[`${splitNames[1]}_prefab`];
            const weaponNameToken = prefab.item_name.substr(1);
            // Storing weapon name
            const weaponName = csgoEnglishTokens[weaponNameToken.toLowerCase()];
            // Getting skin information (name, min, max float)
            const skin = getSkinData(itemsGame, csgoEnglishTokens, splitNames[0]);

            const rarity = getRarityByKey(rarities, rarityKey);

            // Storing weapon's skin full name for quick access
            const weaponSkinFullName = `${weaponName} | ${skin.name}`;
            // Adding item to resulting list for current collection
            collectionsWithSkins[key].items.push({
              fullName: weaponSkinFullName,
              weapon: weaponName,
              skin: skin.name,
              variation: skin.variation,
              min: skin.min,
              max: skin.max,
              rarity,
            });

            // NOTE: Side action. Adding weapon's skin full name to list to create list of all weapon skin names.
            // Will be used at later point
            weaponSkinFullNames.push(weaponSkinFullName);

            // NOTE: Uncomment this to make items be by rarity not in a single array
            // currentCollectionRarity[index] = {
            // 	fullName: `${weaponName} | ${skin.name}`,
            // 	weapon: weaponName,
            // 	skin: skin.name,
            // 	min: skin.min,
            // 	max: skin.max,
            // 	rarity,
            // };
          });
        }
      }
      // If current collection doesn't have items then removing it to ignore empty collections.
      // Those collections are agents so we don't need them
      if (!collectionsWithSkins[key].items.length) {
        delete collectionsWithSkins[key];
      }
    }
  }
  return {
    collectionsWithSkins,
    weaponSkinFullNames,
  };
  // Return collectionsWithItemsByRarity;
}

export function getPaintFromCsgoFloatWeapon(csgoFloatWeapons: { [k: string]: CsgoFloatWeapon }, name: string): Paint {
  const foundPaint = Object.values(csgoFloatWeapons)
    .map((w) => {
      // NOTE: Checking that paint kit name includes our search name because
      // paint kit can contain variations and in our case we don't care about them
      // so any match will satisfy us
      const paint = Object.values(w.paints).filter((wp) => (`${w.name} | ${wp.name}`).includes(name));
      return paint[0];
    })
    // Since we used map then some values will be undefined and we need to get only valid value
    .filter((val) => Boolean(val));

  return foundPaint[0];
}

export function getSkinImage(csgoFloatWeapons: { [k: string]: CsgoFloatWeapon }, name: string) {
  const foundPaint = getPaintFromCsgoFloatWeapon(csgoFloatWeapons, name);
  return foundPaint?.image ?? '';
}

export function getCollectionWithSkin(
  collectionsWithSkins: ICollectionWithSkins,
  skinName: string
): CollectionInfoWithSkin {
  for (const collectionKey in collectionsWithSkins) {
    if (collectionsWithSkins.hasOwnProperty(collectionKey)) {
      const collection = collectionsWithSkins[collectionKey];
      // Searching for item by its skin name & variation
      const foundItem = collection.items.find((item) => item.fullName === skinName);
      if (foundItem) {
        return {
          key: collectionKey,
          skin: foundItem,
        };
      }
    }
  }
  // If nothing was found
  return null;
}

export function getWearIndex(skin: string): number {
  const wears: Wear[] = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
  try {
    const wearFromSkinName = skin.match(/\((.*?)\)/)[1] as Wear;
    // FIXME: Get rid of lodash
    return indexOf(wears, wearFromSkinName);
  } catch (error) {
    return -1;
  }
}


export function getSkinNameWithoutExterior(skin: string): string {
  let skinNameWithoutExterior;
  // Removing extertior from name. Afterwards removing 'Stattrak' label because there will be an option
  // to decide if its stattrak or not
  // NOTE: Regexp src: https://stackoverflow.com/a/10459537
  skinNameWithoutExterior = skin.replace(/ \(([^)]*)\)[^(]*$/, '');

  // If stattrak then removing it as well
  const isStattrak = skinNameWithoutExterior.includes('StatTrak™');
  if (isStattrak) {
    skinNameWithoutExterior = skinNameWithoutExterior.replace('StatTrak™ ', '');
  }
  return skinNameWithoutExterior;
}


export function getSkinPrices(weapons: Map<string, CsgoTraderAppItem>): SkinPriceDictionary {
  const distinct: SkinPriceDictionary = {};
  weapons.forEach((weaponSkin, key) => {
    // Checking if its stattrak item
    const isStattrak = key.includes('StatTrak™');
    // Getting skin name without exterior
    const skinNameWithoutExterior = getSkinNameWithoutExterior(key);
    const wearIndex = getWearIndex(key);
    // Storing current distinct skin key for quick access
    const currentDistinctSkin = distinct[skinNameWithoutExterior];
    // If current distinct skin exists then pushing current weapon skin to its instance list
    if (currentDistinctSkin) {
      // If weapon is stattrak then adding it to stattrak list
      // TODO: Add support for weapon variation and variation prices (Doppler)
      if (isStattrak) {
        currentDistinctSkin.stattrak[wearIndex] = weaponSkin.csgotrader.price;
      } else {
        // Otherwise to normal list
        currentDistinctSkin.normal[wearIndex] = weaponSkin.csgotrader.price;
      }
    } else {
      // Initializing distinct skin object with empty lists
      distinct[skinNameWithoutExterior] = {
        normal: Array(5).fill(null),
        stattrak: Array(5).fill(null),
      };

      // Otherwise creating new distinct skin and setting current weapon skin as its initial skin instance
      // If current weapon is stattrak then adding it to stattrak list
      if (isStattrak) {
        distinct[skinNameWithoutExterior].stattrak[wearIndex] = weaponSkin.csgotrader.price;
      } else {
        // Otherwise to normal list
        distinct[skinNameWithoutExterior].normal[wearIndex] = weaponSkin.csgotrader.price;
      }
    }
  });

  return distinct;
}

export function getWeaponsForSync(
  allWeapons: Map<string, CsgoTraderAppItem>,
  collectionsWithSkins: { [key: string]: CollectionsWithSkin },
  csgoFloatWeapons?: { [k: string]: CsgoFloatWeapon }
): { [k: string]: Weapon } {
  // Dictionary with distincts skins. Value is list of all instances for this given skin (exteriors)
  const distinctSkins = getSkinPrices(allWeapons);

  // Resulting weapons
  const weapons: { [k: string]: Weapon } = {};
  for (const key in distinctSkins) {
    if (distinctSkins.hasOwnProperty(key)) {
      const skinPrice = distinctSkins[key];
      const csgoFloatPaint = getPaintFromCsgoFloatWeapon(csgoFloatWeapons, key);
      const collectionWithSkin = getCollectionWithSkin(collectionsWithSkins, key);
      // Adding weapon to dictionary only if skin is already in collection.
      // Example could be 'M4A4 | Howl' which is not mentioned in one collection
      // and it cannot be received via tradeup
      if (collectionWithSkin?.skin) {
        // Getting simple collection without items
        // Adding current weapon to weapons dictionary
        const keyWithoutDot = key.includes('.') ? key.replace(/[.]/g, DOT_CHAR) : key;
        // TODO:
        weapons[keyWithoutDot] = {
          name: key,
          rarity: collectionWithSkin.skin.rarity,
          price: skinPrice,
          volume: {
            normal: csgoFloatPaint?.normal_volume,
            stattrak: csgoFloatPaint?.stattrak_volume
          },
          normal_nameIds: new Array(5).fill(null).map((item, index) => encodeSkinToId(key, index)),
          stattrak_nameIds: new Array(5).fill(null).map((item, index) => encodeSkinToId(key, index, true)),
          collection: {
            key: collectionWithSkin.key,
            name: collectionsWithSkins[collectionWithSkin.key].name,
          },
          min: collectionWithSkin.skin.min,
          max: collectionWithSkin.skin.max,
          image: csgoFloatWeapons ? getSkinImage(csgoFloatWeapons, key) : '',
          // If skin has ST price then marking as it can be in stattrak
          stattrak: skinPrice.stattrak.some(v => v !== null)
        };
      }
    }
  }

  return weapons;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createSyncResult(
  parsedItemsGame: any,
  parsedCsgoEnglish: any,
  allWeapons: Map<string, CsgoTraderAppItem>,
  csgoFloatWeapons?: { [k: string]: CsgoFloatWeapon }
) {
  // Initializing sync result object. It will get filled with necessary data
  const outputSyncResult = new ItemSync();

  // Setting rarities
  const rarities = getRarities(parsedItemsGame, parsedCsgoEnglish);

  // Setting collections
  const collections = getCollections(parsedCsgoEnglish);

  // Setting wears
  const wears = getWears(parsedCsgoEnglish);

  // Getting collections with skins
  const collectionWithSkins = getCollectionsWithSkins(collections, rarities, parsedItemsGame, parsedCsgoEnglish);

  // // Dictionary with weapon (skin) name IDs
  // const weaponNameIds = createWeaponDictionaryByNameId(collectionWithSkins);

  // Getting information about weapons
  const weapons = getWeaponsForSync(allWeapons, collectionWithSkins.collectionsWithSkins, csgoFloatWeapons);
  // Storing name IDs for each weapon. This will be used for recreating specific tradeups
  // outputSyncResult.nameIds = weaponNameIds;

  // Assigning everything to output sync result object
  Object.assign(outputSyncResult, {
    rarities,
    wears,
    collectionsWithSkins: collectionWithSkins.collectionsWithSkins,
    weaponSkinFullNames: collectionWithSkins.weaponSkinFullNames,
    weapons,
  });
  return outputSyncResult;
}

function handleSpecialCase(weaponSkinFullNames: string[]) {
  const index = weaponSkinFullNames.findIndex((skinName) => skinName.includes('Glock-18 | Gamma Doppler'));

  if (index !== -1) {
    weaponSkinFullNames[index] = weaponSkinFullNames[index].replace(new RegExp(/ \([^)]*\)/g), '');
  }

  return weaponSkinFullNames;
}

// /**
//  * TODO: For backwards compatibility
//  *
//  * @export
//  * @param {{ [key: string]: CollectionsWithSkin }} collectionDictionary
//  * @return {*} 
//  */
// export function createWeaponDictionaryByNameId(collectionDictionary: { [key: string]: CollectionsWithSkin }) {
//   // Resulting dictionary
//   const nameIdDictionary = {};
//   const nameIdSet = new Set<string>();
//   for (const key in collectionDictionary) {
//     if (Object.prototype.hasOwnProperty.call(collectionDictionary, key)) {
//       const collection = collectionDictionary[key];
//       collection.items.forEach(item => nameIdDictionary[encodeSkinToId(item.fullName)]);
//     }
//   }
//   // // Resulting dictionary
//   // const nameIdDictionary = {};
//   // // Walking through each weapon and storing its name ID and skin name as value
//   // // to compare and know which skin to look for
//   // Object.keys(weapons).forEach((key) => {
//   //   nameIdDictionary[weapons[key].nameID] = getSkinNameWithoutExterior(weapons[key]);
//   // });
//   return nameIdSet;
// }

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getPrice(prices: Prices) {
  // If we have unstable reason then handling them
  if (prices.unstable_reason) {
    switch (prices.unstable_reason) {
      // If there were low sales during last week then taking safe prices for last 7 days
      case 'LOW_SALES_WEEK':
        // Same issue. Price is unstable and during the last 30 days only 1 item was sold for 0.2$ but the actual price is 22$
        return prices.median / prices.safe_ts.last_7d > 1.5 ? prices.avg : prices.safe_ts.last_7d;
      // If there were low sales during last month (30 days) then
      // depending which prices to take
      case 'LOW_SALES_MONTH':
        // Same issue. Price is unstable and during the last 30 days only 1 item was sold for 0.2$ but the actual price is 22$

        // Calculating difference for week and month between median and safe price
        const weekPriceDifference = prices.median / prices.safe_ts.last_7d;
        const monthPriceDifference = prices.median / prices.safe_ts.last_30d;

        // If both week & month price differences are above 1.5 then returning average price
        if (weekPriceDifference > 1.5 && monthPriceDifference > 1.5) {
          return prices.avg;
        } else {
          // Otherwise we are checking if month difference is lower. In this case
          // we are taking safe price for month
          if (weekPriceDifference - monthPriceDifference > 0) {
            return prices.safe_ts.last_30d;
          } else {
            // Otherwise week difference is lower so we are taking that value
            return prices.safe_ts.last_7d;
          }
        }
      default:
        // In all other cases we are returning safe prices
        return prices.safe;
    }
  } else {
    // NOTE: Safe price means its calculated against possible market manipulations.

    // There are cases where safe price is not safe enough. This often happens to new cases where
    // they have stable prices but safe price might be lower than actual price. In this case average price
    // seems like more reliable. One of the indicators is difference betwweeen median and safe price.
    // If median/safe price is more than 1.5x then it might indicate that safe price won't work.
    // NOTE: Median/safe might change in the future since its also experimental
    if (prices.median / prices.safe > 1.5) {
      return prices.avg;
    } else {
      // If price doesn't have unstable reason then using safe price
      // because it seems much reliable than average because with if item
      // was sold for high amount then average would be affected but safe price
      // would remain "safe".
      return prices.safe;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
/**
 * Not used
 * @deprecated
 * @export
 * @param {Wear[]} wears
 * @param {*} wearIndex
 * @param {*} currDistinctSkin
 * @param {*} currWeapon
 */
export function setInfoByWear(wears: Wear[], wearIndex: any, currDistinctSkin: any, currWeapon: any) {
  const currNormalSkin = currDistinctSkin.normal.find((skin) => skin.market_name.includes(wears[wearIndex]));
  if (currNormalSkin) {
    // Getting price that would be more accurate based on other params
    currWeapon.normal_prices[wearIndex] = getPrice(currNormalSkin.prices);
    // Setting volume. If there is no average daily volume then setting it to "0" by default
    currWeapon.normal_volume[wearIndex] = currNormalSkin.prices.sold.avg_daily_volume || 0;
    // Setting name ID of specific item
    currWeapon.normal_nameIds[wearIndex] = currNormalSkin.nameID;

    // Setting image for current skin
    const itemIndex = currDistinctSkin.normal.findIndex((item) => item.market_name.includes(wears[wearIndex]));
    // Setting image for skin if it doesn't yet exist
    if (!currWeapon.image) {
      // As image we are taking best possible wear. For example, if there is no FN wear then
      // we are taking first found wear
      currWeapon.image = currDistinctSkin.normal[itemIndex !== -1 ? itemIndex : 0].image;
    }
  }
  const currStattrakSkin = currDistinctSkin.stattrak.find((skin) => skin.market_name.includes(wears[wearIndex]));
  if (currStattrakSkin) {
    // Getting price that would be more accurate based on other params
    currWeapon.stattrak_prices[wearIndex] = getPrice(currStattrakSkin.prices);
    // Setting volume. If there is no average daily volume then setting it to "0" by default
    currWeapon.stattrak_volume[wearIndex] = currStattrakSkin.prices.sold.avg_daily_volume || 0;
    // Setting name ID of specific item
    currWeapon.stattrak_nameIds[wearIndex] = currStattrakSkin.nameID;

    // Setting that current skin has stattrak
    currWeapon.stattrak = true;
  }
}

export function encodeSkinToId(name: string, wearIndex: number, stattrak?: boolean): string {
  return Buffer.from(`${stattrak ? 'ST--' : ''}${wearIndex}--${name}`, 'utf8').toString('base64');
}

export function decodeIdToSkin(id: string): DecodedSkinInfo {
  try {
    const content = Buffer.from(id, 'base64').toString('utf8').split('--');
    // If we have information about ST then length will be 3 items and therefore
    // we can splice array and convert it to true so our content array will consist
    // only of wear index and skin name
    const isStattrak = content.length === 3 ? !!content.splice(0, 1) : false;
    return {
      stattrak: isStattrak,
      wearIndex: +content[0],
      name: content[1]
    };
  } catch (err) {
    return undefined;
  }
}

/**
 * Model for steam inventory item
 *
 * @export
 * @class InventoryItem
 */
export class InventoryItem {
  /**
   * Item's asset ID. Previous it was `itemid` but after CSGO Floats update (maybe even Valve update)
   * this `itemid` disappeared but `floatid` appeared. So for now we will assume that its new unique ID
   *
   * @type {string}
   * @memberof InventoryItem
   */
  floatid: string;
  /**
   * Item's definition index
   *
   * @type {number}
   * @memberof InventoryItem
   */
  defindex: number;
  /**
   * Item's paint index
   *
   * @type {number}
   * @memberof InventoryItem
   */
  paintindex: number;
  /**
   * Numeric rarity
   *
   * @type {number}
   * @memberof InventoryItem
   */
  rarity: number;
  /**
   * Numeric quality
   *
   * @type {number}
   * @memberof InventoryItem
   */
  quality: number;
  /**
   * Item's paint seed
   *
   * @type {number}
   * @memberof InventoryItem
   */
  paintseed: number;
  /**
   * What kind of statistic the StatTrak version of this item tracks (may be null if not StatTrak)
   * `True` if Stattrak.
   *
   * @type {number}
   * @memberof InventoryItem
   */
  killeaterscoretype?: number;
  /**
   * Item's tracked statistic value (kills)
   *
   * @type {*}
   * @memberof InventoryItem
   */
  killeatervalue?: any;
  /**
   * Item's custom name via a name tag, or null if none
   *
   * @type {string}
   * @memberof InventoryItem
   */
  customname?: string;
  /**
   * An array of objects describing the stickers applied to this item
   *
   * @type {any[]}
   * @memberof InventoryItem
   */
  stickers: any[];
  /**
   * Mumeric origin of this item
   *
   * @type {number}
   * @memberof InventoryItem
   */
  origin: number;
  /**
   * Unknown. Usually null
   *
   * @type {*}
   * @memberof InventoryItem
   */
  dropreason?: any;
  s: string;
  a: string;
  d: string;
  m: string;
  /**
   * Float value
   *
   * @type {number}
   * @memberof InventoryItem
   */
  floatvalue: number;
  /**
   * Image url
   *
   * @type {string}
   * @memberof InventoryItem
   */
  imageurl: string;
  /**
   * Min float
   *
   * @type {number}
   * @memberof InventoryItem
   */
  min: number;
  /**
   * Max float
   *
   * @type {number}
   * @memberof InventoryItem
   */
  max: number;
  /**
   * Weapon type
   *
   * @type {string}
   * @memberof InventoryItem
   */
  weapon_type: string;
  /**
   * Skin (item) name
   *
   * @type {string}
   * @memberof InventoryItem
   */
  item_name: string;
  /**
   * Name of rarity
   *
   * @type {string}
   * @memberof InventoryItem
   */
  rarity_name: string;
  /**
   * Name of quality
   *
   * @type {string}
   * @memberof InventoryItem
   */
  quality_name: string;
  /**
   * Name of Origin (For example: Found in crate / Crafted)
   *
   * @type {string}
   * @memberof InventoryItem
   */
  origin_name: string;
  /**
   * Wear name
   *
   * @type {string}
   * @memberof InventoryItem
   */
  wear_name: string;
  /**
   * Full item name for display
   *
   * @type {string}
   * @memberof InventoryItem
   */
  full_item_name: string;
  /**
   * Helper property that allows us to understand if current weapon is Stattrak or Normal.
   * We need this because otherwise its a little bit hard to get this information and it requires additional steps
   *
   * @type {boolean}
   * @memberof InventoryItem
   */
  stattrak?: boolean;
  /**
   * Helper property to mark this specific inventory item as selected
   *
   * @type {boolean}
   * @memberof InventoryItem
   */
  selected?: boolean;
}

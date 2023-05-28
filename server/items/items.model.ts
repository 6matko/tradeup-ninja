import { SkinPrice } from '../core/interfaces/csgoTraderApp.interface';

export type Wear = 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';

export interface SkinVolume {
  normal: number[];
  stattrak: number[];
}

//#region New models
export interface RootObject {
  wears: string[];
  rarities: Rarity[];
  collectionsWithSkins: { [key: string]: CollectionsWithSkin };
  weapons: { [key: string]: Weapon };
  /**
   * Weapon IDs. Value represents skin name
   *
   * @type {{ [key: string]: string }}
   * @memberof RootObject
   */
  nameIds: { [key: string]: string };
  /**
   * Latest date when prices were updated/synced
   *
   * @type {(string | Date)}
   * @memberof RootObject
   */
  lastUpdate: string | Date;
}

export interface Collection {
  key: string;
  name: string;
}

export interface CollectionsWithSkin extends Collection {
  items: Item[];
}

export interface Item {
  fullName: string;
  weapon: WeaponEnum;
  skin: string;
  /**
   * Skin variation (Phase 1 / Phase 2 / Emerald / etc...)
   *
   * @type {string}
   * @memberof Item
   */
  variation?: string;
  min: number;
  max: number;
  rarity: Rarity;
}

export interface Rarity {
  value: number;
  key: RarityKey;
  name?: RarityName;
}

export enum RarityKey {
  Ancient = 'ancient',
  Common = 'common',
  Default = 'default',
  Immortal = 'immortal',
  Legendary = 'legendary',
  Mythical = 'mythical',
  Rare = 'rare',
  Uncommon = 'uncommon',
  Unusual = 'unusual',
}

export enum RarityName {
  Classified = 'Classified',
  ConsumerGrade = 'Consumer Grade',
  Contraband = 'Contraband',
  Covert = 'Covert',
  IndustrialGrade = 'Industrial Grade',
  MilSpecGrade = 'Mil-Spec Grade',
  Restricted = 'Restricted',
  Stock = 'Stock',
}

export enum WeaponEnum {
  Ak47 = 'AK-47',
  Aug = 'AUG',
  Awp = 'AWP',
  CZ75Auto = 'CZ75-Auto',
  DesertEagle = 'Desert Eagle',
  DualBerettas = 'Dual Berettas',
  Famas = 'FAMAS',
  FiveSeveN = 'Five-SeveN',
  G3Sg1 = 'G3SG1',
  GalilAR = 'Galil AR',
  Glock18 = 'Glock-18',
  M249 = 'M249',
  M4A1S = 'M4A1-S',
  M4A4 = 'M4A4',
  MAC10 = 'MAC-10',
  Mag7 = 'MAG-7',
  Mp5SD = 'MP5-SD',
  Mp7 = 'MP7',
  Mp9 = 'MP9',
  Negev = 'Negev',
  Nova = 'Nova',
  P2000 = 'P2000',
  P250 = 'P250',
  P90 = 'P90',
  PPBizon = 'PP-Bizon',
  R8Revolver = 'R8 Revolver',
  SawedOff = 'Sawed-Off',
  Scar20 = 'SCAR-20',
  Sg553 = 'SG 553',
  Ssg08 = 'SSG 08',
  Tec9 = 'Tec-9',
  Ump45 = 'UMP-45',
  UspS = 'USP-S',
  Xm1014 = 'XM1014',
}

export interface Weapon {
  name: string;
  rarity: Rarity;
  price: SkinPrice;
  volume: SkinVolume;
  normal_volume?: Array<number | null>;
  stattrak_volume?: Array<number | null>;
  normal_nameIds: Array<string>;
  stattrak_nameIds: Array<string>;
  collection: Collection;
  min: number;
  max: number;
  image: string;
  stattrak?: boolean;
  /**
   * Helper flag that indicates that item doesn't have price on SCM so
   * this might be useful for cases where user can set own custom price
   *
   * @type {boolean}
   * @memberof Weapon
   */
  noSCMPrice?: boolean;
  /**
   * Helper flag that indicates if specific item has different variations. Currently
   * it is for cases where Glock-18 has different variations like Emerald, Phase 1, etc...
   *
   * @type {string}
   * @memberof Weapon
   */
  variation?: string;
}
//#endregion

export interface ICollectionWithSkins {
  [key: string]: CollectionsWithSkin;
}

/**
 * Model for item syncing. This information is used to provide necessary information for tradeups
 *
 * @export
 * @class ItemSync
 */
export class ItemSync {
  rarities: Rarity[] = [];
  // collections: Collection[] = [];
  wears: Wear[] = [];
  collectionsWithSkins: ICollectionWithSkins;
  // weaponSkinFullNames: string[] = [];
  weapons: { [k: string]: Weapon };
  nameIds: { [k: string]: string };
  lastUpdate: Date;
}

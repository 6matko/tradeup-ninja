export interface CSGOFloatSchema {
  collections: Collection[];
  rarities: Rarity[];
  stickers: { [key: string]: string };
  weapons: { [key: string]: CsgoFloatWeapon };
  wears: string[];
}

export interface Collection {
  key: string;
  name: string;
  has_souvenir?: boolean;
  has_crate?: boolean;
}

export interface Rarity {
  key: string;
  name: string;
  value: number;
}

export interface CsgoFloatWeapon {
  name: string;
  sticker_amount: number;
  type: Type;
  paints: { [key: string]: Paint };
}

export interface Paint {
  max: number;
  min: number;
  rarity: number;
  name: string;
  collection?: string;
  image: string;
  normal_prices?: Array<number | null>;
  normal_volume?: Array<number | null>;
  souvenir?: boolean;
  stattrak?: boolean;
  stattrak_prices?: Array<number | null>;
  stattrak_volume?: Array<number | null>;
}

export enum Type {
  Gloves = 'Gloves',
  Knives = 'Knives',
  Weapons = 'Weapons',
}

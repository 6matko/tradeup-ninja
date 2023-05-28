export interface CsgoTraderAppData {
  [k: string]: CsgoTraderAppItem;
}

export interface CsgoTraderAppItem {
  market_name: string;
  steam: Steam;
  bitskins: Bitskins | null;
  lootfarm: number | null;
  csgotm: null | string;
  csmoney: Csgotrader | null;
  skinport: Skinport | null;
  csgotrader: Csgotrader;
  csgoempire: number | null;
  swapgg: number | null;
  csgoexo: number | null;
  cstrade: Cstrade | null;
  skinwallet: number | null;
  buff163: Buff163;
}

export interface Bitskins {
  price: string;
  instant_sale_price: null | string;
}

export interface Buff163 {
  starting_at: Cstrade | null;
  highest_order: Cstrade | null;
}

export interface Cstrade {
  price: number | null;
  doppler?: Doppler;
}

export interface Doppler {
  Sapphire?: number | null;
  Ruby?: number | null;
  'Black Pearl'?: number | null;
  Emerald?: number | null;
  'Phase 1'?: number | null;
  'Phase 2'?: number | null;
  'Phase 3'?: number | null;
  'Phase 4'?: number | null;
}

export interface Csgotrader {
  price: number | null;
  doppler?: { [key: string]: number | null };
}

export interface Skinport {
  suggested_price: number | null;
  starting_at: number | null;
}

export interface Steam {
  last_24h: number | null;
  last_7d: number | null;
  last_30d: number | null;
  last_90d: number | null;
}

export interface SkinPrice {
  normal: number[];
  stattrak: number[];
}

export interface SkinPriceDictionary {
  [k: string]: SkinPrice;
}

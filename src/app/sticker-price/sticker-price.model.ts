export interface Steam {
    last_90d: number;
    last_30d: number;
    last_7d: number;
    last_24h: number;
}

export interface Bitskins {
    price: string;
    instant_sale_price: string;
}

export interface Csmoney {
    price: number;
}

export interface Skinport {
    suggested_price: number;
    steam_price: number;
    instant_price: number;
    starting_at: number;
}

export interface Csgotrader {
    price: number;
}

export interface StartingAt {
    price: number;
}

export interface HighestOrder {
    price: number;
}

export interface Buff163 {
    starting_at: StartingAt;
    highest_order: HighestOrder;
}

export interface CsgoTraderAppItemPrices {
    steam: Steam;
    bitskins: Bitskins;
    lootfarm: number;
    csgotm: string;
    csmoney: Csmoney;
    skinport: Skinport;
    csgotrader: Csgotrader;
    csgoempire: number;
    swapgg: number;
    csgoexo: number;
    buff163: Buff163;
}

export interface CsgoTraderAppItemForSelect {
    key: string;
    prices: CsgoTraderAppItemPrices;
}

/**
 * Model for CSGO sticker without price
 *
 * @export
 * @class Sticker
 */
export class Sticker {
    image: string;
    market_hash_name: string;
    nameID: string;
}

export class SelectedSticker extends Sticker implements CsgoTraderAppItemForSelect {
    key: string;
    prices: CsgoTraderAppItemPrices;
    /**
     * Price of currently selected price provider
     *
     * @type {number}
     * @memberof SelectedSticker
     */
    providerPrice: number;
}

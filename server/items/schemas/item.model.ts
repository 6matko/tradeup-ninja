export interface SteamItem {
    updated_at: number;
    prices: Prices;
    image: string;
    border_color: string;
    market_hash_name: string;
    market_name: string;
    nameID: string;
}

export interface Prices {
    first_seen: number;
    unstable_reason: string;
    unstable: boolean;
    sold: SafeTs;
    safe_ts: SafeTs;
    safe: number;
    median: number;
    mean: number;
    max: number;
    avg: number;
    min: number;
    latest: number;
}

export interface SafeTs {
    last_90d: number;
    last_30d: number;
    last_7d: number;
    last_24h: number;
    avg_daily_volume?: number;
}

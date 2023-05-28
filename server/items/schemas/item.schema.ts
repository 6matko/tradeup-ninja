// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// export class SafeTs extends Document {
//     @Prop()
//     last_90d: number;

//     @Prop()
//     last_30d: number;

//     @Prop()
//     last_7d: number;

//     @Prop()
//     last_24h: number;

//     @Prop()
//     avg_daily_volume: number;
// }

// export class Prices extends Document {
//     @Prop()
//     first_seen: number;

//     @Prop()
//     unstable_reason: boolean;

//     @Prop()
//     unstable: boolean;

//     @Prop({ type: SafeTs })
//     sold: SafeTs;

//     @Prop({ type: SafeTs })
//     safe_ts: SafeTs;

//     @Prop()
//     safe: number;

//     @Prop()
//     median: number;

//     @Prop()
//     mean: number;

//     @Prop()
//     max: number;

//     @Prop()
//     avg: number;

//     @Prop()
//     min: number;

//     @Prop()
//     latest: number;
// }

// @Schema()
// export class SteamItem extends Document {
//     @Prop()
//     updated_at: number;

//     @Prop({ type: Prices })
//     prices: Prices;

//     @Prop()
//     image: string;

//     @Prop()
//     border_color: string;

//     @Prop({ index: true })
//     market_hash_name: string;

//     @Prop({ index: true })
//     market_name: string;

//     @Prop({ index: true })
//     nameID: string;
// }

// export const SteamItemSchema = SchemaFactory.createForClass(SteamItem);

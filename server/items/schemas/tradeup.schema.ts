
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
// import { RarityKey, RarityName, WeaponEnum, Wear } from '../items.model';

// export class Collection extends Document {
//     @Prop()
//     key: string;

//     @Prop()
//     name: string;
// }

// export class Rarity extends Document {
//     @Prop()
//     value: number;

//     @Prop({ type: String, enum: RarityKey })
//     key: RarityKey;

//     @Prop({ required: false, type: String, enum: RarityName })
//     name: RarityName;
// }

// export class Item extends Document {
//     @Prop()
//     fullName: string;

//     @Prop({ type: String, enum: WeaponEnum })
//     weapon: WeaponEnum;

//     @Prop()
//     skin: string;

//     @Prop()
//     min: number;

//     @Prop()
//     max: number;

//     @Prop({ type: Rarity })
//     rarity: Rarity;
// }

// export class CollectionsWithSkin extends Document {
//     @Prop()
//     name: string;

//     @Prop()
//     key: string;

//     @Prop({ type: [Item] })
//     items: Item[];
// }

// // export class CollectionWithSkins {
// //     @Prop()
// //     [key: string]: CollectionsWithSkin;
// // }

// export class Weapon extends Document {
//     @Prop()
//     name: string;

//     @Prop({ type: Rarity })
//     rarity: Rarity;

//     @Prop({ type: [Number] })
//     normal_prices: number[];

//     @Prop({ type: [Number] })
//     stattrak_prices: number[];

//     @Prop({ type: [Number] })
//     normal_volume: number[];

//     @Prop({ type: [Number] })
//     stattrak_volume: number[];

//     @Prop({ type: [String] })
//     normal_nameIds: string[];

//     @Prop({ type: [String] })
//     stattrak_nameIds: string[];

//     @Prop()
//     min: number;

//     @Prop()
//     max: number;

//     @Prop()
//     image: string;

//     @Prop({ default: false })
//     stattrak: boolean;
// }

// @Schema({ timestamps: true })
// export class TradeupNinja extends Document {

//     @Prop()
//     rarities: Rarity[];

//     @Prop()
//     collections: Collection[];

//     @Prop({ type: [String] })
//     wears: Wear[];

//     @Prop()
//     // tslint:disable-next-line:ban-types
//     collectionsWithSkins: Object;

//     @Prop({ type: [String] })
//     weaponSkinFullNames: string[];

//     @Prop()
//     // tslint:disable-next-line:ban-types
//     weapons: Object;

//     @Prop()
//     // tslint:disable-next-line:ban-types
//     nameIds: Object;
// }

// // @Schema()
// // export class TradeupData extends Document {
// //     @Prop({ type: [Rarity] })
// //     rarities: Rarity[];

// //     @Prop({ type: [Collection] })
// //     collections: Collection[];

// //     @Prop({ type: [String] })
// //     wears: Wear[];

// //     @Prop({ type: [CollectionWithSkins] })
// //     collectionsWithSkins: CollectionWithSkins[];

// //     @Prop({ type: [String] })
// //     weaponSkinFullNames: string[];

// //     @Prop({ type: [Weapon] })
// //     weapons: Weapon[];

// //     @Prop({ type: [String] })
// //     nameIds: string[];
// // }

// export const TradeupNinjaSchema = SchemaFactory.createForClass(TradeupNinja);

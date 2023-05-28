import { CacheModule, Module } from '@nestjs/common';
import { StickerPriceController } from './sticker-price.controller';
import { StickerPriceService } from './sticker-price.service';

@Module({
  imports: [
    CacheModule.register({
      // Setting caching to 30 minutes becausse its good enough for items
      // to update data every 30 mins because in reallity data is updated
      // somewhere around once every 3hh
      ttl: 1800,
    }),
  ],
  controllers: [StickerPriceController],
  providers: [StickerPriceService],
})
export class StickerPriceModule {}

import { CacheInterceptor, Controller, Get, UseInterceptors } from '@nestjs/common';
import { StickerPriceService } from './sticker-price.service';
@Controller('sp')
export class StickerPriceController {
  constructor(private readonly stickerPriceService: StickerPriceService) {}

  @Get('prices')
  @UseInterceptors(CacheInterceptor)
  async getCsgoTraderAppPrices(): Promise<any[]> {
    const result = await this.stickerPriceService.getCsgoTraderAppPrices();
    return result;
  }
}

import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { HttpCacheInterceptor } from '../core/interceptors/test-caching.interceptor';
import { ItemSync } from './items.model';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) { }

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  async getLatest(): Promise<ItemSync> {
    return this.itemsService.getLatest();
  }

  @Get('stickers')
  @UseInterceptors(HttpCacheInterceptor)
  async getStickers(): Promise<any[]> {
    return this.itemsService.getStickers();
  }
}

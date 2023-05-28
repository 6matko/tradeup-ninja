import { CacheModule, HttpModule, Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  imports: [
    CacheModule.register({
      // Setting caching to 30 minutes becausse its good enough for items
      // to update data every 30 mins because in reallity data is updated
      // somewhere around once every 3h
      ttl: 1800,
    }),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule implements OnModuleInit {
  constructor(private readonly itemsService: ItemsService) { }

  onModuleInit() {
    // As soon as this module is initialized, we need to sync items so there won't be cases
    // where after deployment there are no stored files for display.
    this.itemsService.syncItems();
  }
}

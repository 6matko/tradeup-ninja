import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 30,
    }),
    AuthModule,
    HttpModule,
  ],
  controllers: [
    InventoryController,
  ],
  providers: [
    InventoryService,
  ],
  exports: [
    InventoryService,
  ],
})
export class InventoryModule { }

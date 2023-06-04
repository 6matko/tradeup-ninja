import { Module } from '@nestjs/common';
import { AngularUniversalModule } from '@nestjs/ng-universal';
import { join } from 'path';
import { AppServerModule } from '../src/main.server';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { ItemsModule } from './items/items.module';
import { StickerPriceModule } from './sticker-price/sticker-price.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AngularUniversalModule.forRoot({
      bootstrap: AppServerModule,
      // IMPORTANT NOTE: If we need "LOCAL DEV" then this value should be "dist/browser".
      // For PRODUCTION and deployment it should be "browser".
      viewsPath: join(process.cwd(), process.env['IS_PRODUCTION'] === '1' ? 'browser' : 'dist/browser')
    }),
    ItemsModule,
    StickerPriceModule,
    AuthModule,
    UsersModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }

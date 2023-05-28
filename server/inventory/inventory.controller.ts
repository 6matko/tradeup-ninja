import { CacheTTL, Controller, Get, Req, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonalizedHttpCacheInterceptor } from '../core/interceptors/personalized-caching.interceptor';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
    constructor(
        private readonly inventoryService: InventoryService
    ) { }


    @Get()
    @UseGuards(JwtAuthGuard)
    // Caching for 5 minutes to prevent Steam overload
    @CacheTTL(300)
    @UseInterceptors(PersonalizedHttpCacheInterceptor)
    async getInventory(@Req() req: Request): Promise<any> {
        // Storing steam ID for easy access and casting to "any" because we have custom User model.
        // We need to get Steam ID from this user
        const steamId = (req.user as any)?.steamId;
        // If we couldn't find Steam ID then throwing unauthorized exception cause why wouldn't there
        // be Steam ID in other cases ?
        if (!steamId) {
            return new UnauthorizedException();
        }
        // Getting CSGO inventory for current user
        const result = await this.inventoryService.getCSGOInventory(steamId);
        return result;
    }
}

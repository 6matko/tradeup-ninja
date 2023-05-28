import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { AuthService } from './auth.service';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService,
    ) {
        super({
            returnURL: `${process.env['CURRENT_HOSTNAME']}/api/auth/steam/return`,
            realm: `${process.env['CURRENT_HOSTNAME']}/`,
            apiKey: process.env['STEAM_API_KEY'],
        });
    }

    async validate(steamUrlIdentifier: string, profile: any): Promise<any> {
        // Validating user by his Steam ID (Actually creating/updating)
        const user = await this.authService.validateUser(profile);
        return user;
    }
}

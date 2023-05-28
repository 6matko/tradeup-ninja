import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(profile: any): Promise<any> {
        // Creating or updating user info
        const user = await this.usersService.createOrUpdate(profile);
        // If all good then returning updated user
        if (user) {
            return user;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.displayName, sub: user.steamId, photoUrl: user.photoUrl };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}

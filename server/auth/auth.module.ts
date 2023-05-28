import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { SteamStrategy } from './steam.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'],
      // 7 days
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    AuthService,
    SteamStrategy,
    JwtStrategy,
  ],
  exports: [
    AuthService,
    JwtModule,
  ],
})
export class AuthModule { }

import { Controller, Get, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { SteamAuthGuard } from './auth/steam-auth.guard';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(SteamAuthGuard)
  @Get('auth/login')
  login(@Req() req: any) {
    // This doesn't do anything because this endpoint initiates Login via Steam (redirect to steam page)
    // and on success it returns back to /auth/steam/return endpoint
  }

  @UseGuards(SteamAuthGuard)
  @Get('auth/steam/return')
  async returnToHome(@Req() req: any, @Res() res: Response) {
    const token = await this.authService.login(req.user);
    if (!token) {
      throw new UnauthorizedException();
    }

    // Setting expiry date for auth cookie for 7 days.
    // MaxAge didn't work for some reason
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    res.cookie('ninjaAccessToken', token.access_token, {
      httpOnly: true,
      expires: expiryDate,
      secure: true,
    });

    // Redirecting user back to home page
    return res.redirect(`/`);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }
}

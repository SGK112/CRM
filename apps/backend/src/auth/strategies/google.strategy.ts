import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const clientID = configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
    const configuredCallback = configService.get('GOOGLE_REDIRECT_URI');

    // Use provided credentials or dummy values to prevent startup errors
    // Prefer explicit GOOGLE_REDIRECT_URI; else default to non-prefixed path for local dev
    // We expose both /auth/google/callback (no prefix) and /api/auth/google/callback (prefixed) via main.ts exclusion
    const callbackURL = configuredCallback || 'http://localhost:3001/auth/google/callback';
    super({
      clientID: clientID && !clientID.includes('your-google') ? clientID : 'dummy-client-id',
      clientSecret:
        clientSecret && !clientSecret.includes('your-google')
          ? clientSecret
          : 'dummy-client-secret',
      callbackURL,
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
    });

    const logger = new Logger('GoogleStrategy');
    logger.log(`Google OAuth configured callback URL: ${callbackURL}`);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: unknown,
    done: VerifyCallback
  ): Promise<void> {
    try {
      const p = profile as {
        id?: string;
        name?: { givenName?: string; familyName?: string };
        emails?: Array<{ value?: string }>;
        photos?: Array<{ value?: string }>;
      };

      if (!p.emails?.[0]?.value) {
        return done(new Error('No email found in Google profile'), null);
      }

      const user = {
        id: p.id,
        email: p.emails[0].value,
        firstName: p.name?.givenName || '',
        lastName: p.name?.familyName || '',
        picture: p.photos?.[0]?.value,
        accessToken,
        refreshToken,
      };

      const existingUser = await this.authService.findOrCreateGoogleUser(user);
      done(null, existingUser);
    } catch (error) {
      done(error instanceof Error ? error : new Error('Google authentication failed'), null);
    }
  }
}

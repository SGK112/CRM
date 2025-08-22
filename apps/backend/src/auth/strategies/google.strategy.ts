import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
  const clientID = configService.get('GOOGLE_CLIENT_ID');
  const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
  const configuredCallback = configService.get('GOOGLE_REDIRECT_URI');
    
    // Use provided credentials or dummy values to prevent startup errors
  // Important: Global prefix is 'api', controller base includes 'auth', so default callback must be /api/auth/google/callback
  const callbackURL = configuredCallback || 'http://localhost:3001/api/auth/google/callback';
    super({
      clientID: (clientID && !clientID.includes('your-google')) ? clientID : 'dummy-client-id',
      clientSecret: (clientSecret && !clientSecret.includes('your-google')) ? clientSecret : 'dummy-client-secret',
      callbackURL,
      scope: ['email', 'profile'],
    });

    const logger = new Logger('GoogleStrategy');
    logger.log(`Google OAuth configured callback URL: ${callbackURL}`);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };

    // Check if user exists, if not create them
    const existingUser = await this.authService.findOrCreateGoogleUser(user);
    
    done(null, existingUser);
  }
}

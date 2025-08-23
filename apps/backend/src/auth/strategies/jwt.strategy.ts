import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // Primary: lookup by sub
    let user = await this.authService.findUserById(payload.sub);
    // Fallback: some legacy tokens might have mismatched sub; fallback to email
    if (!user && payload.email) {
      user = await this.authService.findUserByEmail(payload.email);
    }
    if (!user) throw new UnauthorizedException();

    // Special handling for super admin - ensure they have full access
    if (user.email === 'help.remodely@gmail.com') {
      user.role = 'owner';
      user.subscriptionPlan = 'growth';
      user.subscriptionStatus = 'active';
      user.workspaceId = user.workspaceId || 'super_admin_workspace';
    }

    // Dev-only testing override for demo account
    try {
      const allowOverride = (process.env.NODE_ENV !== 'production') || process.env.ALLOW_DEMO_OVERRIDE === '1';
      if (allowOverride && user.email?.toLowerCase() === 'demo@test.com') {
        user.subscriptionPlan = 'growth';
        user.subscriptionStatus = 'active';
      }
    } catch {
      // no-op
    }

    return user;
  }
}

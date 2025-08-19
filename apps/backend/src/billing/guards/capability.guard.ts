import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURES_KEY } from '../decorators/requires-feature.decorator';
import { capabilitiesForPlan } from '../capabilities';

@Injectable()
export class CapabilityGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(FEATURES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || [];
    if (!required.length) return true;
    const req = context.switchToHttp().getRequest();
    const plan: string | undefined = req.user?.subscriptionPlan;
    const caps = capabilitiesForPlan(plan);
    const missing = required.filter(r => !caps.has(r));
    if (missing.length) {
      throw new ForbiddenException(`Plan '${plan || 'free'}' missing features: ${missing.join(', ')}`);
    }
    return true;
  }
}

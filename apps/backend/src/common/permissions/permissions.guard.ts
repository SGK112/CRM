import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { hasPermission } from './permissions.const';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const reqPerms: string[] = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || [];
    if (!reqPerms.length) return true;
    const req = context.switchToHttp().getRequest();
    const role: string | undefined = req.user?.role;
    const missing = reqPerms.filter(p => !hasPermission(role as any, p as any));
    if (missing.length) {
      throw new ForbiddenException(`Missing permission(s): ${missing.join(', ')}`);
    }
    return true;
  }
}

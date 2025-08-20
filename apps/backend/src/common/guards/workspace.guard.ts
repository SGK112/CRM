import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user; // populated by JWT strategy
    if (!user) throw new ForbiddenException('Unauthenticated');
    if (!user.workspaceId) throw new ForbiddenException('Workspace missing');
    req.workspaceId = user.workspaceId;
    return true;
  }
}

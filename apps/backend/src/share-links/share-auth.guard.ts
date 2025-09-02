import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ShareAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth) return false;
    const m = /Bearer\s+(.*)/i.exec(auth as string);
    if (!m) return false;
    try {
      const decoded: any = this.jwt.verify(m[1]);
      if (decoded.scope !== 'share') return false;
      req.share = decoded;
      // attach minimal workspace context for downstream queries
      if (!req.user) req.user = { workspaceId: decoded.workspaceId, role: 'client' };
      return true;
    } catch {
      return false;
    }
  }
}

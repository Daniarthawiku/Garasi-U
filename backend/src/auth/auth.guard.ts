import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import type { AuthTokenPayload } from './entities/user.entity.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    request.user = this.authService.verifyToken(token);
    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      for (const pair of cookieHeader.split(';')) {
        const idx = pair.indexOf('=');
        if (idx === -1) continue;
        const key = pair.slice(0, idx).trim();
        const val = pair.slice(idx + 1).trim();
        if (key === 'garasiu_session' && val) {
          return decodeURIComponent(val);
        }
      }
    }

    return null;
  }
}

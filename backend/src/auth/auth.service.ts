import {
  createHmac,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { SignupDto } from './dto/signup.dto.js';
import {
  AuthTokenPayload,
  PublicUser,
  User,
} from './entities/user.entity.js';

interface DummyAccountJson {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  primaryVehicle?: string;
}

export type { AuthTokenPayload, PublicUser };

@Injectable()
export class AuthService {
  private readonly users: User[] = [];

  constructor() {
    this.loadLocalDummyAccount();
  }

  private getSigningSecret(): string {
    return (
      process.env.AUTH_SECRET || 'garasiu-local-dev-secret-9f4c2a8b1d7e6035'
    );
  }

  private hashPassword(password: string, salt: string): string {
    return scryptSync(password, salt, 64).toString('hex');
  }

  private verifyPassword(password: string, user: User): boolean {
    const computed = Buffer.from(
      this.hashPassword(password, user.salt),
      'hex',
    );
    const stored = Buffer.from(user.passwordHash, 'hex');
    if (computed.length !== stored.length) return false;
    return timingSafeEqual(computed, stored);
  }

  private loadLocalDummyAccount(): void {
    const candidatePaths = [
      resolve(import.meta.dirname, 'dummy-account.local.json'),
      resolve(process.cwd(), 'src/auth/dummy-account.local.json'),
      resolve(process.cwd(), 'backend/src/auth/dummy-account.local.json'),
    ];

    const foundPath = candidatePaths.find((p) => existsSync(p));
    if (!foundPath) return;

    try {
      const raw = readFileSync(foundPath, 'utf8');
      const parsed = JSON.parse(raw) as DummyAccountJson;
      if (!parsed.email || !parsed.password) return;

      const normalizedEmail = parsed.email.trim().toLowerCase();
      if (this.users.some((u) => u.email === normalizedEmail)) return;

      const salt = randomBytes(16).toString('hex');
      const now = new Date();
      this.users.push({
        id: parsed.id || randomUUID(),
        name: parsed.name?.trim() || 'GarasiU Owner',
        email: normalizedEmail,
        primaryVehicle: parsed.primaryVehicle?.trim() || null,
        salt,
        passwordHash: this.hashPassword(parsed.password, salt),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      // Abaikan jika file lokal tidak valid JSON
    }
  }

  private signToken(payload: AuthTokenPayload): string {
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signature = createHmac('sha256', this.getSigningSecret())
      .update(encodedPayload)
      .digest('base64url');
    return `${encodedPayload}.${signature}`;
  }

  verifyToken(token: string): AuthTokenPayload {
    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const [encodedPayload, providedSignature] = parts;
    const expectedSignature = createHmac('sha256', this.getSigningSecret())
      .update(encodedPayload)
      .digest('base64url');

    const providedBuf = Buffer.from(providedSignature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (
      providedBuf.length !== expectedBuf.length ||
      !timingSafeEqual(providedBuf, expectedBuf)
    ) {
      throw new UnauthorizedException('Invalid authentication signature');
    }

    let payload: AuthTokenPayload;
    try {
      payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as AuthTokenPayload;
    } catch {
      throw new UnauthorizedException('Malformed authentication token');
    }

    if (!payload.sub || !payload.exp || payload.exp <= Date.now()) {
      throw new UnauthorizedException('Authentication session has expired');
    }

    return payload;
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      primaryVehicle: user.primaryVehicle,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  login(loginDto: LoginDto): { accessToken: string; user: PublicUser } {
    const normalizedEmail = loginDto.email.trim().toLowerCase();
    const user = this.users.find((u) => u.email === normalizedEmail);

    if (!user || !this.verifyPassword(loginDto.password, user)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ttlMs = loginDto.rememberMe
      ? 7 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;
    const accessToken = this.signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      exp: Date.now() + ttlMs,
    });

    return {
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  signup(signupDto: SignupDto): { accessToken: string; user: PublicUser } {
    const normalizedEmail = signupDto.email.trim().toLowerCase();
    const existing = this.users.find((u) => u.email === normalizedEmail);
    if (existing) {
      throw new ConflictException(
        `Account with email "${normalizedEmail}" already exists`,
      );
    }

    const salt = randomBytes(16).toString('hex');
    const now = new Date();
    const newUser: User = {
      id: randomUUID(),
      name: signupDto.fullName.trim(),
      email: normalizedEmail,
      primaryVehicle: signupDto.primaryVehicle?.trim() || null,
      salt,
      passwordHash: this.hashPassword(signupDto.password, salt),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(newUser);

    const accessToken = this.signToken({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
      user: this.toPublicUser(newUser),
    };
  }

  getProfile(userId: string): PublicUser {
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      throw new UnauthorizedException('User session is no longer valid');
    }
    return this.toPublicUser(user);
  }
}

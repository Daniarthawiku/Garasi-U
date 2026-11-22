import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createInMemoryPrismaMock } from '../prisma/prisma-mock.helper.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: createInMemoryPrismaMock(),
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should register a new user via signup and verify issued token', async () => {
    const signupResult = await authService.signup({
      fullName: 'Karl Benz',
      email: 'newowner@example.com',
      primaryVehicle: 'Porsche 911 GT3',
      password: 'StrongPassword123!',
    });

    expect(signupResult.accessToken).toBeDefined();
    expect(signupResult.user.email).toBe('newowner@example.com');

    const payload = authService.verifyToken(signupResult.accessToken);
    expect(payload.sub).toBe(signupResult.user.id);
    expect(payload.email).toBe('newowner@example.com');
  });

  it('should reject duplicate signup emails and wrong login passwords', async () => {
    await authService.signup({
      fullName: 'Owner One',
      email: 'owner1@example.com',
      password: 'Password123!',
    });

    await expect(
      authService.signup({
        fullName: 'Owner Two',
        email: 'owner1@example.com',
        password: 'Password456!',
      }),
    ).rejects.toThrow(ConflictException);

    await expect(
      authService.login({
        email: 'owner1@example.com',
        password: 'WrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject tampered or invalid tokens', () => {
    expect(() => authService.verifyToken('invalid.token.here')).toThrow(
      UnauthorizedException,
    );
    expect(() => authService.verifyToken('abc.def')).toThrow(
      UnauthorizedException,
    );
  });
});

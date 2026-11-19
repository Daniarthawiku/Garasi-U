export class User {
  id: string;
  name: string;
  email: string;
  primaryVehicle: string | null;
  salt: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PublicUser {
  id: string;
  name: string;
  email: string;
  primaryVehicle: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
}

// src/types/jwt-payload.interface.ts
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}
import jwt from 'jsonwebtoken';

type JWTPayload = Record<string, any>;

export const signJwt = (payload: JWTPayload, secret: string, expiresIn: string) =>
  jwt.sign(payload, secret, { expiresIn });

export const verifyJwt = (token: string, secret: string) =>
  jwt.verify(token, secret) as JWTPayload;
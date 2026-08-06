import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import { AppError } from './errorHandler';

export interface IDecodedToken {
  id: string;
  role: 'customer' | 'barber' | 'admin';
}

export interface IAuthRequest extends Request {
  user?: IDecodedToken;
}

export const authenticate = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided, authorization denied', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as IDecodedToken;
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Token is not valid or expired', 401));
  }
};

export const authorize = (roles: Array<'customer' | 'barber' | 'admin'>) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('User authentication details not loaded', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorized to access this resource', 403));
    }

    next();
  };
};

import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AppError } from '../middlewares/errorHandler';

// Helper middleware to check validation results
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : '',
      msg: err.msg,
    }));
    return next(new AppError('Validation failed', 400, errorDetails));
  }
  next();
};

export const chatValidator = [
  body('sessionId')
    .notEmpty()
    .withMessage('sessionId is required')
    .isString()
    .withMessage('sessionId must be a string'),
  body('messageText')
    .notEmpty()
    .withMessage('messageText is required')
    .isString()
    .withMessage('messageText must be a string'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('userId must be a valid Mongo ID'),
  validate,
];

export const bookValidator = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('userId must be a valid Mongo ID'),
  body('barberId')
    .notEmpty()
    .withMessage('barberId is required')
    .isMongoId()
    .withMessage('barberId must be a valid Mongo ID'),
  body('serviceIds')
    .notEmpty()
    .withMessage('serviceIds list is required')
    .isArray({ min: 1 })
    .withMessage('serviceIds must be a non-empty array of service IDs'),
  body('serviceIds.*')
    .isMongoId()
    .withMessage('Each service ID must be a valid Mongo ID'),
  body('date')
    .notEmpty()
    .withMessage('Appointment date/time is required')
    .isISO8601()
    .withMessage('date must be a valid ISO 8601 date-time string'),
  body('totalAmount')
    .notEmpty()
    .withMessage('totalAmount is required')
    .isNumeric()
    .withMessage('totalAmount must be a number'),
  body('notes')
    .optional()
    .isString()
    .withMessage('notes must be a string'),
  validate,
];

export const cancelValidator = [
  body('appointmentId')
    .notEmpty()
    .withMessage('appointmentId is required')
    .isMongoId()
    .withMessage('appointmentId must be a valid Mongo ID'),
  validate,
];

export const rescheduleValidator = [
  body('appointmentId')
    .notEmpty()
    .withMessage('appointmentId is required')
    .isMongoId()
    .withMessage('appointmentId must be a valid Mongo ID'),
  body('newDate')
    .notEmpty()
    .withMessage('newDate is required')
    .isISO8601()
    .withMessage('newDate must be a valid ISO 8601 date-time string'),
  validate,
];

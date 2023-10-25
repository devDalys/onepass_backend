import {Request, Response, NextFunction} from 'express';
import {validationResult} from 'express-validator';
import {sendError} from '../utils/SendError';

export const expressValidator = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return sendError({res, errorCode: 404, messageText: 'Произошла какая-то ошибка'});
  }
  next();
};

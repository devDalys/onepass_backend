import express from 'express';
import jwt from 'jsonwebtoken';
import {sendError} from './SendError';

export const checkAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.token as string;

  if (!token) {
    return sendError({res, errorCode: 404, messageText: 'Что-то пошло не так'});
  }

  try {
    const result = jwt.verify(token, `${process.env.JWT_SECRET}`) as {_id: string};
    req.body.userId = result._id;
    next();
  } catch (e) {
    console.error(e);
    return sendError({res, errorCode: 403, messageText: 'Доступ закрыт'});
  }
};

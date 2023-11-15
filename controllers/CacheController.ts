import {NextFunction, Request, Response} from 'express';
import {cache} from '../index';
import {sendSuccess} from '../utils/SendError';
export const cacheController = async (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers.token + req.url.split('/')[1];
  const cachedValue = cache.get(key) as string;
  if (cachedValue) {
    console.log(req.url, 'CACHE HIT');
    sendSuccess(res, JSON.parse(cachedValue));
  } else {
    console.log(req.url, 'CACHE MISS');
    next();
  }
};

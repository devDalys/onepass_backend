import {cache} from '../index';
import {Request} from 'express';

export const saveCache = (req: Request, value: any) => {
  cache.set(req.headers.token + req.url.split('/')[1], JSON.stringify(value));
};

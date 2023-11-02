import {body} from 'express-validator';

export const addAccountValidator = [
  body('login').isString(),
  body('password').isString(),
  body('iconSrc').isURL().optional(),
];

import {body} from 'express-validator';

export const addAccountValidator = [
  body('login').isString(),
  body('password').isString(),
  body('iconSrc').isURL().optional(),
  body('socialName').isString().isLength({min: 2, max: 20}),
];

import {body} from 'express-validator';

export const registerValidator = [
  body('email').isEmail(),
  body('name').isLength({min: 3, max: 20}),
  body('password').isLength({min: 5, max: 20}),
  body('avatarUrl').isURL().optional(),
];

export const loginValidator = [
  body('email').isEmail(),
  body('password').isLength({
    min: 5,
    max: 20,
  }),
];

export const loginSocialController = [
  body('social').optional().isString(),
  body('silence_token').optional().isString(),
];

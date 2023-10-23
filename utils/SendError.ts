import * as express from 'express';
export const HTTP_CLIENT_ERROR_CODES = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  unsupportedMediaType: 415,
  teapot: 418,
} as const;

export const HTTP_SERVER_ERROR_CODES = {
  internalServerError: 500,
} as const;

export const HTTP_ERROR_CODES = {
  ...HTTP_CLIENT_ERROR_CODES,
  ...HTTP_SERVER_ERROR_CODES,
} as const;

export const HTTP_RESPONSE_CODES = {
  ...HTTP_ERROR_CODES,
} as const;

type FailureProps = {
  res: express.Response,
  errorCode: typeof HTTP_ERROR_CODES[keyof typeof HTTP_ERROR_CODES],
  messageText: string
}


export const sendError = ({res, errorCode, messageText}: FailureProps) => {
  return res.status(errorCode).json({
    msg: messageText,
  });
};

export const sendSuccess = (res: express.Response, data: any) => {
  return res.json({
    ...data,
    status: 200,
  });
};

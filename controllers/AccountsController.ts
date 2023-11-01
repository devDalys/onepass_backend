import {NextFunction, Request, Response} from 'express';
import UserModel from '../models/users';
import jwt from 'jsonwebtoken';
import {sendError, sendSuccess} from '../utils/SendError';

interface Account {
  login: string;
  password: string;
  iconSrc: string;
}

const addAccount = async (req: Request<any, any, Account>, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const id = jwt.verify(token, `${process.env.JWT_SECRET}`) as {_id: string};

    await UserModel.updateOne(
      {_id: id},
      {
        $push: {
          accounts: req.body,
        },
      },
    );
    sendSuccess(res, {msg: 'Аккаунт успешно добавлен'});
  } catch (e) {
    sendError({res, messageText: 'Не удалось добавить аккаунт', errorCode: 500});
  }
};

export const accountsController = {
  addAccount,
};

import {NextFunction, Request, Response} from 'express';
import UserModel from '../models/users';
import jwt from 'jsonwebtoken';
import {sendError, sendSuccess} from '../utils/SendError';
import Users from '../models/users';

interface Account {
  login: string;
  password: string;
  iconSrc: string;
}

const addAccount = async (req: Request<any, any, Account>, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const id = jwt.verify(token, `${process.env.JWT_SECRET}`) as {_id: string};
    console.log(token);

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

const getAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const id = jwt.verify(token, `${process.env.JWT_SECRET}`) as {_id: string};
    const user = await UserModel.findById(id);
    if (user && 'accounts' in user) {
      sendSuccess(res, user.accounts);
    } else {
      console.error('Не удалось получить аккаунты');
      sendError({res, errorCode: 500, messageText: 'Аккаунтов нет'});
    }
  } catch (e) {
    console.error(e);
    sendError({res, errorCode: 500, messageText: 'Аккаунтов нет'});
  }
};

export const accountsController = {
  addAccount,
  getAccounts,
};

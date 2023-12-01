import {NextFunction, Request, Response} from 'express';
import UserModel from '../models/users';
import jwt from 'jsonwebtoken';
import {sendError, sendSuccess} from '../utils/SendError';
import {saveCache} from '../utils/SaveCache';

interface Account {
  login: string;
  password: string;
  iconSrc: string;
  socialName: string;
  _id?: string;
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

const getAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const id = jwt.verify(token, `${process.env.JWT_SECRET}`) as {_id: string};
    const user = await UserModel.findById(id);
    if (user && 'accounts' in user) {
      saveCache(req, user.accounts);
      sendSuccess(res, {body: user.accounts});
    } else {
      console.error('Не удалось получить аккаунты');
      sendError({res, errorCode: 500, messageText: 'Аккаунтов нет'});
    }
  } catch (e) {
    console.error(e);
    sendError({res, errorCode: 500, messageText: 'Аккаунтов нет'});
  }
};

export const updateAccount = async (req: Request<any, any, Account>, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const userId = jwt.verify(token, `${process.env.JWT_SECRET}`) as {_id: string};

    const user = await UserModel.findById(userId);
    const accountIndex = user?.accounts.findIndex((item) => item._id?.equals(req.body?._id as string));
    const account = user?.accounts.find((item) => item._id?.equals(req.body?._id as string));

    if (user?.accounts && account) {
      account.login = req.body.login;
      account.password = req.body.password;
      account.socialName = req.body.socialName;

      user?.accounts.set(accountIndex as number, account);
      user?.save();

      sendSuccess(res, {
        msg: 'Аккаунт успешно обновлён',
      });
    } else {
      sendError({res, errorCode: 404, messageText: 'Не найдено'});
      console.error('Произошла ошибка добавления аккаунта');
    }
  } catch (e) {
    sendError({res, errorCode: 500, messageText: 'Не найдено'});
    console.error('Что-то пошло не так', e);
  }
};

export const accountsController = {
  addAccount,
  getAccounts,
  updateAccount,
};

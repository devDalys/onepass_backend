import {NextFunction, Request, Response} from 'express';
import UserModel from '../models/users';
import jwt from 'jsonwebtoken';
import {sendError, sendSuccess} from '../utils/SendError';
import {saveCache} from '../utils/SaveCache';
import bcrypt from 'bcrypt';

interface Account {
  login: string;
  password: string;
  iconSrc: string;
  socialName: string;
  _id: string;
}

const addAccount = async (req: Request<any, any, Account>, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const id = jwt.verify(token, `${process.env.JWT_SECRET}`) as {_id: string};
    const {password, ...accountBody} = req.body;
    const hashPassword = jwt.sign(password, `${process.env.JWT_SECRET}`);

    const user = await UserModel.findById(id._id);
    if (!user) {
      return sendError({res, errorCode: 403, messageText: 'Доступ закрыт'});
    }

    const existedAccounts = user.accounts.find(
      (item) => item?.socialName?.toLowerCase().trim() === req.body.socialName.toLowerCase().trim(),
    );

    if (existedAccounts) {
      existedAccounts.accountEntries.push({...req.body, password: hashPassword});
      await user.save();
    } else {
      user.accounts.push({
        socialName: req.body.socialName,
        accountEntries: [
          {
            ...accountBody,
            password: hashPassword,
          },
        ],
      });
      await user.save();
    }

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
      const decodedAccounts = user.accounts.map((account) => ({
        ...account.toObject(),
        accountEntries: account.accountEntries.map((accountEntity) => ({
          ...accountEntity.toObject(),
          password: jwt.verify(accountEntity.password as string, `${process.env.JWT_SECRET}`),
        })),
      }));

      saveCache(req, {body: decodedAccounts});
      sendSuccess(res, {body: decodedAccounts});
    } else {
      console.error('Не удалось получить аккаунты');
      sendError({res, errorCode: 403, messageText: 'Доступ закрыт'});
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
    const {_id, password, login} = req.body;

    const account = user?.accounts
      .flatMap((account) => account.accountEntries)
      .find((entry) => entry?._id?.equals(_id));

    if (account && user) {
      const hashPassword = jwt.sign(password, `${process.env.JWT_SECRET}`);

      Object.assign(account, {login: login, password: hashPassword});

      await user.save();
      sendSuccess(res, {
        body: account,
      });
    } else {
      sendError({res, errorCode: 404, messageText: 'Не найдено'});
      console.error('Произошла ошибка добавления аккаунта');
    }
  } catch (e) {
    sendError({res, errorCode: 500, messageText: 'Что-то пошло не так'});
    console.error('Что-то пошло не так', e);
  }
};

const deleteAccount = async (req: Request<any, any, any>, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const userId = jwt.verify(token, `${process.env.JWT_SECRET}`) as {_id: string};
    const accountId = req.params.id;

    const user = await UserModel.findById(userId);

    if (user) {
      const accounts = user.accounts.find((account) =>
        account.accountEntries.find((entry) => entry?._id?.equals(accountId)),
      );

      if (accounts?.accountEntries.length !== 1) {
        accounts?.accountEntries?.pull({_id: accountId});
      } else {
        accounts.deleteOne();
      }

      await user.save();
      sendSuccess(res, {msg: 'Аккаунт успешно удалён'});
    } else {
      sendError({res, errorCode: 500, messageText: 'Что-то пошло не так'});
    }
  } catch (e) {
    sendError({res, errorCode: 500, messageText: 'Что-то пошло не так'});
    console.error('Что-то пошло не так', e);
  }
};

export const accountsController = {
  addAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
};

import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/users';
import {sendError, sendSuccess} from '../utils/SendError';

interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

const registerController = async (req: Request<any, any, RegisterRequest>, res: Response, next: NextFunction) => {
  try {
    const {
      body: {name, password, email},
    } = req;

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const user = new UserModel({
      email,
      name,
      password: hashPassword,
    });

    const doc = await user.save();

    const token = jwt.sign({_id: doc._id}, `${process.env.JWT_SECRET}`);
    const {password: _pass, ...otherData} = doc.toObject();

    sendSuccess(res, {
      ...otherData,
      token,
    });
  } catch (e) {
    console.error(e);
    sendError({res, errorCode: 400, messageText: 'Произошла ошибка регистрации'});
  }
};

const loginController = async (req: Request<any, any, LoginRequest>, res: Response) => {
  try {
    const {
      body: {password, email},
    } = req;

    const user = await UserModel.findOne({email});
    if (!user) {
      return sendError({errorCode: 500, res, messageText: 'Неверный логин или пароль'});
    }

    const isValidPath = await bcrypt.compare(password, user.password);

    if (isValidPath) {
      const token = jwt.sign(
        {
          _id: user._id,
        },
        `${process.env.JWT_SECRET}`,
        {
          expiresIn: '30d',
        },
      );

      const {password, ...otherInfo} = user.toObject();

      return sendSuccess(res, {...otherInfo, token});
    }
  } catch (e) {
    console.error(e);
    sendError({res, errorCode: 500, messageText: 'Неверный логин или пароль'});
  }
};

export const getMeController = async (req: Request<any, any, LoginRequest>, res: Response) => {
  try {
    const token = req.headers.token as string;
    const id = jwt.verify(token, `${process.env.JWT_SECRET}`) as {_id: string};

    const user = await UserModel.findById(id);

    if (!user) {
      console.error('не получилось получить пользователя');
      return sendError({res, errorCode: 403, messageText: 'Доступ закрыт'});
    }

    const {password, accounts, ...userInfo} = user.toObject();
    sendSuccess(res, userInfo);
  } catch (e) {
    console.error(e, 'не получилось получить пользователя');
    sendError({res, errorCode: 403, messageText: 'Доступ закрыт'});
  }
};

export const authController = {
  registerController,
  loginController,
  getMeController,
};

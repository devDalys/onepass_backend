import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/users';
import {sendError, sendSuccess} from '../utils/SendError.ts';

interface RegisterRequest {
  email: string;
  name: string;
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

    const token = jwt.sign({_id: doc._id}, process.env.JWT_SECRET as string);
    const {password: _pass, ...otherData} = doc.toObject();

    sendSuccess(res, {
      ...otherData,
      token,
    });
  } catch (e) {
    console.error(e);
    sendError({res, errorCode: 400, messageText: 'Произошла ошибка авторизаии'});
  }
};

export const authController = {
  registerController,
};

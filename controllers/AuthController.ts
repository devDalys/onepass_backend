import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/users';

interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

const registerController = async (req: Request<any, any, RegisterRequest>, res: Response, next: NextFunction) => {
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

  res.send({
    ...otherData,
    token,
  });
};

export const authController = {
  registerController,
};

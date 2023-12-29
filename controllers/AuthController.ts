import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/users';
import {sendError, sendSuccess} from '../utils/SendError';
import {saveCache} from '../utils/SaveCache';
import {LoginRequest, RegisterRequest, SocialLoginRequest, UpdateRequest, VKLoginProps, YandexResponse} from './types';

const registerController = async (req: Request<any, any, RegisterRequest>, res: Response) => {
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
    } else {
      await Promise.reject('Неверный пароль');
    }
  } catch (e) {
    console.error(e);
    sendError({res, errorCode: 500, messageText: 'Неверный логин или пароль'});
  }
};

const socialLoginController = async (req: Request<any, any, SocialLoginRequest>, res: Response) => {
  const {social, silence_token, uuid} = req.body;

  const socialLogin = async ({
    email,
    name,
    password,
    avatarUrl,
  }: {
    name: string;
    email: string;
    avatarUrl: string;
    password: string;
  }) => {
    const user = await UserModel.findOne({email: email});

    if (!user) {
      const userModel = new UserModel({
        name: name,
        email: email,
        avatarUrl: avatarUrl ?? '',
        password: password,
      });
      const doc = await userModel.save();

      const token = jwt.sign({_id: doc._id}, `${process.env.JWT_SECRET}`);
      const {password: _pass, ...otherData} = doc.toObject();

      sendSuccess(res, {
        ...otherData,
        token,
      });
    } else {
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
  };

  switch (social) {
    case 'VK': {
      try {
        const versionApi = '5.131';

        const searchParams = new URLSearchParams({
          v: versionApi,
          uuid: uuid as string,
          token: silence_token,
          access_token: process.env['VK_ACCESS_TOKEN'] as string,
        });

        const silence_auth = await fetch(
          `https://api.vk.com/method/auth.exchangeSilentAuthToken?${searchParams.toString()}`,
        ).then((data) => data.json());

        const profile: VKLoginProps = await fetch(
          `https://api.vk.com/method/account.getProfileInfo?v=${versionApi}&access_token=${silence_auth.response?.access_token}`,
        ).then((data) => data.json());

        const email = profile.response.mail || silence_auth.response.email;
        if (!email) sendError({res, errorCode: 500, messageText: 'Авторизация через VK временно недоступна'});

        await socialLogin({
          name: `${profile.response.first_name} ${profile.response.last_name}`,
          email: email,
          avatarUrl: profile.response.photo_200,
          password: silence_auth.response?.access_token,
        });
      } catch (e) {
        console.error(e);
        sendError({res, errorCode: 401, messageText: 'Не удалось авторизоваться через VK'});
      }
      break;
    }
    case 'Yandex': {
      try {
        const data: YandexResponse = await fetch('https://login.yandex.ru/info?format=json', {
          headers: {Authorization: `OAuth ${silence_token}`},
        }).then((data) => data.json());
        const avatarUrl = data.is_avatar_empty
          ? ''
          : `https://avatars.mds.yandex.net/get-yapic/${data.default_avatar_id}/islands-200`;
        await socialLogin({
          name: data.real_name,
          email: data.default_email,
          avatarUrl: avatarUrl,
          password: silence_token,
        });
      } catch (e) {
        console.error(e);
        sendError({res, errorCode: 401, messageText: 'Не удалось авторизоваться через Yandex'});
      }
    }
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
    saveCache(req, userInfo);
    sendSuccess(res, userInfo);
  } catch (e) {
    console.error(e, 'не получилось получить пользователя');
    sendError({res, errorCode: 403, messageText: 'Доступ закрыт'});
  }
};

export const updateProfile = async (req: Request<any, any, UpdateRequest>, res: Response) => {
  try {
    const token = req.headers.token as string;
    const id = jwt.verify(token, `${process.env.JWT_SECRET}`) as {_id: string};

    const user = await UserModel.findById(id);

    if (!user || !req.body) {
      console.error('не получилось получить пользователя');
      return sendError({res, errorCode: 403, messageText: 'Доступ закрыт'});
    }
    for (let [key, value] of Object.entries(req.body)) {
      if (value && key !== 'password') {
        user.set(key, value);
      }

      if (key === 'password') {
        const salt = await bcrypt.genSalt();
        const passHash = await bcrypt.hash(value, salt);
        user.set(key, passHash);
      }
    }

    await user.save();
    const {password, accounts, ...userInfo} = user.toObject();
    saveCache(req, userInfo);
    sendSuccess(res, userInfo);
  } catch (e) {
    console.error(e);
    sendError({res, errorCode: 403, messageText: 'Доступ закрыт'});
  }
};

export const authController = {
  registerController,
  loginController,
  getMeController,
  socialLoginController,
  updateProfile,
};

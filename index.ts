import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import {expressValidator, loginValidator, registerValidator} from './validators';
import {authController} from './controllers/AuthController';
import {accountsController} from './controllers/AccountsController';
import {checkAuth} from './utils/CheckAuth';
import {addAccountValidator} from './validators/AccountValidator';
import morgan from 'morgan';
import {LRUCache} from 'lru-cache';
import {cacheController} from './controllers/CacheController';

const port = 8888;
const dbUrl = 'mongodb://127.0.0.1:27017';

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan(':method :url :status :response-time ms'));
dotenv.config();

const options = {
  maxSize: 5000,
  ttl: 1000 * 60 * 5,
  sizeCalculation: (value: string, key: string) => {
    return value.length + key.length;
  },
  updateAgeOnGet: false,
};
export const cache = new LRUCache(options);

app.listen(port, () => {
  console.log('Сервер запущен на порту', port);
  mongoose.connect(dbUrl, {dbName: 'onepass'});
});
mongoose.connection.on('connected', () => console.log('Подключение к DB установлено'));
//ручки авторизации
app.post('/auth/register', registerValidator, expressValidator, authController.registerController);
app.post('/auth/login', loginValidator, expressValidator, authController.loginController);
app.get('/auth/me', checkAuth, cacheController, authController.getMeController);
//ручки работы с аккаунтами юзера
app.get('/accounts', checkAuth, cacheController, accountsController.getAccounts);
app.post('/accounts/add', checkAuth, addAccountValidator, expressValidator, accountsController.addAccount);
app.delete('/accounts/:id', checkAuth, addAccountValidator, expressValidator, accountsController.addAccount);
app.put('/accounts/update', checkAuth, addAccountValidator, expressValidator, accountsController.updateAccount);

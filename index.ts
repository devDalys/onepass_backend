import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import {expressValidator, loginValidator, registerValidator} from './validators';
import {authController} from './controllers/AuthController';
import {accountsController} from './controllers/AccountsController';
import {checkAuth} from './utils/CheckAuth';
import {addAccountValidator} from './validators/AccountValidator';

const port = 8888;
const dbUrl = 'mongodb://127.0.0.1:27017';

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

app.listen(port, () => {
  console.log('Сервер запущен на порту', port);
  mongoose.connect(dbUrl, {dbName: 'onepass'});
});
mongoose.connection.on('connected', () => console.log('Подключение к DB установлено'));

app.post('/auth/register', registerValidator, expressValidator, authController.registerController);
app.post('/auth/login', loginValidator, expressValidator, authController.loginController);
app.post('/accounts/add', checkAuth, addAccountValidator, expressValidator, accountsController.addAccount);
app.get('/auth/me', checkAuth, authController.getMeController);
app.get('/accounts', checkAuth, accountsController.getAccounts);

import express from 'express'
import mongoose from "mongoose";
import dotenv from 'dotenv'
import cors from 'cors'

const port = 8888;
const dbUrl = 'mongodb://127.0.0.1:27017';

const app = express();
app.use(express.json())
app.use(cors())
dotenv.config()

app.listen(port, () => {
    console.log('Сервер запущен')
    mongoose.connect(dbUrl, {dbName: 'onepass'})
})
mongoose.connection.on('connected', () =>
    console.log('Подключение к DB установлено')
)


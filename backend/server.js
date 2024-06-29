import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import connectMongoDB from './db/connectMongoDB.js';

dotenv.config();

const app = express();
const PORT = 5000;
app.use(express.json()); // to parse req.body
app.use(express.urlencoded({extended: true})); // to parse form url_encoded data

app.use(cookieParser());

app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
    connectMongoDB();
})
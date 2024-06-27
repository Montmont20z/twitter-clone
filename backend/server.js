import express from 'express';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import connectMongoDB from './db/connectMongoDB.js';

dotenv.config();

const app = express();
const PORT = 5000;

app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
    connectMongoDB();
})
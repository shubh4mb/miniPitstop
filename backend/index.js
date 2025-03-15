import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import userRoute from './routes/User.route.js'
import authRoute from './routes/Auth.route.js'
import adminRoute from './routes/Admin.route.js'
import { errorHandler } from './middleware/error.middleware.js';
const PORT = process.env.PORT;

const app=express()
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));  
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

mongoose.connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    // //("Error connecting to MongoDB:", error);
  });

app.use('/api/user', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/admin', adminRoute)


// Handle 404 errors for undefined routes
app.all('*', (req, res, next) => {
  next(new Error(404, `Route ${req.originalUrl} not found`));
});

// Global error handling middleware
app.use(errorHandler);


app.listen(PORT, ()=>{
  console.log(`SERVER RUNNING  ${PORT}!!`);
});
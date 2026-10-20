import express from 'express';
import 'dotenv/config';
import connectDB from './db.js';
import cors from 'cors';


import adminRouter from './routers/adminRouter.js';
import userRouter from './routers/userRoutes.js';
import productRouter from './routers/productRouters.js';
import orderRouter from './routers/orderRoutes.js';
import cartRouter from './routers/cartRouter.js';
import dashBoardRouter from './routers/dashboardRoute.js';

import reviewRouter from './routers/reviewRoutes.js';

import cookieParser from 'cookie-parser';

import moyasarRouter from './routers/moyasarPaymentRoute.js';




const app = express();

const PORT = process.env.PORT || 3000



app.use(cors({
  origin: [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://forever-ecommerce-f73m.vercel.app',
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// api endpoints

app.use('/api/v1/user',userRouter)  // http://localhost:5000/api/v1/user/register
app.use('/api/v1/product',productRouter);
app.use('/api/v1/order',orderRouter);
app.use ('/api/v1/cart',cartRouter);  // http://localhost:5000/api/v1/cart/add


 app.use ('/api/v1/payment', moyasarRouter)
 // Admin Panel Login endpoint

 app.use ('/api/v1/admin',adminRouter)

 // ---------------Dashboard----------------
 app.use ('/api/v1/admin/dashboard',dashBoardRouter);

 // ---------------Review Route----------------------

 app.use ('/api/v1/review', reviewRouter);




app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running at port ${PORT}`)
})
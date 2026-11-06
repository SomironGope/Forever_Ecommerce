import express from 'express';
import 'dotenv/config';
import connectDB from './db.js';
import cors from 'cors';


import adminRouter from './routers/adminRoute.js';
import userRouter from './routers/userRoute.js';
import productRouter from './routers/productRoute.js';
import orderRouter from './routers/orderRoute.js';
import bannerRouter from './routers/bannerRoute.js';
import cartRouter from './routers/cartRoute.js';
import dashBoardRouter from './routers/dashboardRoute.js';
import contactRouter from './routers/contactRoute.js';

import reviewRouter from './routers/reviewRoute.js';
import moyasarRouter from './routers/moyasarPaymentRoute.js';

import cookieParser from 'cookie-parser';






const app = express();

const PORT = process.env.PORT || 3000



app.use(cors({
  origin: [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://forever-ecommerce-f73m.vercel.app',
  "https://forever-ecommerce-14hq.vercel.app",
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// api endpoints

app.use('/api/v1/user',userRouter)  // http://localhost:5000/api/v1/user/register
app.use('/api/v1/contact', contactRouter )
app.use('/api/v1/product',productRouter);
app.use ('/api/v1/banner', bannerRouter);
app.use('/api/v1/order',orderRouter);
app.use ('/api/v1/cart',cartRouter);  // http://localhost:5000/api/v1/cart/add


 app.use ('/api/v1/payment', moyasarRouter)
 // Admin Panel Login endpoint

 app.use ('/api/v1/admin',adminRouter)

 // ---------------Dashboard----------------
 app.use ('/api/v1/admin/dashboard',dashBoardRouter);

 // ---------------Review Route----------------------

 app.use ('/api/v1/review', reviewRouter);


async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running at port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();



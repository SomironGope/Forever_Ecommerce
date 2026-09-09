import express from 'express';
import 'dotenv/config';
import connectDB from './db.js';
import cors from 'cors';


import adminRouter from './routers/adminRouter.js';
import userRouter from './routers/userRoutes.js';
import productRouter from './routers/productRouters.js';
import orderRouter from './routers/orderRoutes.js';
import cartRouter from './routers/cartRouter.js';


import cookieParser from 'cookie-parser';
import sslcommerzPaymentRouter from './routers/sslcommerzPaymentRoute.js'

// import paymentRouter from './routers/stripePaymentRoutes.js';

// import { stripeWebhook } from './controllers/paymentControllers.js';


const app = express();

const PORT = process.env.PORT || 3000

// Middlewares
// ----------Stripe ------
// app.post('/api/v1/payment/stripe/webhook',
//    express.raw({type: "application/json"}),
//   stripeWebhook
//   );  // Webhook
// --------------------------------

// SSLCOMMERZ PAYMENT


app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174'],
  Credential: true
}));
app.use(cookieParser());

// api endpoints

app.use('/api/v1/user',userRouter)  // http://localhost:5000/api/v1/user/register
app.use('/api/v1/product',productRouter);
app.use('/api/v1/order',orderRouter);
app.use ('/api/v1/cart',cartRouter);  // http://localhost:5000/api/v1/cart/add

// Stripe International Payment  temporarily disabled
// app.use ('/api/v1/payment',paymentRouter );
 app.use ('/api/v1/payment', sslcommerzPaymentRouter);
 // Admin Panel Login endpoint

 app.use ('/api/v1/admin',adminRouter)


app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running at port ${PORT}`)
})
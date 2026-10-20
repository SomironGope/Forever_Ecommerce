import express from 'express';
import { createMoyasarPayment, refundMoyasarPayment, verifyMoyasarPayment } from '../controllers/moyasarPaymentController.js';
import { isAdmin, isAuthenticate } from '../middleware/isAuthenticate.js';

const moyasarRouter = express.Router();




moyasarRouter.post ('/moyasar/create',isAuthenticate,createMoyasarPayment)

moyasarRouter.post ('/moyasar/verify', isAuthenticate, verifyMoyasarPayment)

moyasarRouter.post ('/refund/:orderId', isAuthenticate, isAdmin, refundMoyasarPayment);

export default moyasarRouter;
import express from 'express';
import { createPayment, sslcommerzCancel, sslcommerzFailed, sslcommerzIPN, sslcommerzSuccess } from '../controllers/sslcommerzPaymentController.js';
import { isAuthenticate } from '../middleware/isAuthenticate.js';



const router = express.Router();


router.post('/sslcommerz/create',isAuthenticate,createPayment);

router.post ('/sslcommerz/success', sslcommerzSuccess);

router.post ('/sslcommerz/fail',sslcommerzFailed);

router.post ('/sslcommerz/cancel', sslcommerzCancel);

router.post ('/sslcommerz/ipn', sslcommerzIPN);




export default router;
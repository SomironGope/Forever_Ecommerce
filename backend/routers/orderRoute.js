import express from 'express';
import { isAdmin, isAuthenticate } from '../middleware/isAuthenticate.js';
import { cancelOrder, createOrder, getAllOrders, getMyOrders, getPaymentAnalytics, getSingleOrder,getSingleOrderAdmin, updateOrderStatus, updatePaymentStatus } from '../controllers/orderControllers.js';

const router = express.Router();



// ------------------------Create Orders ----------------------------------


router.post ('/', isAuthenticate,createOrder);

// --------------------------Get My Orders ------------------------------

router.get ('/my-orders', isAuthenticate,getMyOrders);

// ----------------------------Get All Orders ----------------------

router.get ('/all-orders', isAuthenticate,isAdmin,getAllOrders);


//======================Get Payment Analytics==================

router.get ('/payment-analytics', isAuthenticate, isAdmin, getPaymentAnalytics);

// ------------------Get Signle Order-------------------------

router.get ('/:orderId',isAuthenticate,getSingleOrder);



//--------------------------Admin Routes-----------------------------

router.get ('/admin/:orderId', isAuthenticate, isAdmin, getSingleOrderAdmin)

// ----------------------------Update OrderStatus---------------------------

router.put ('/update-status/:orderId', isAuthenticate, isAdmin, updateOrderStatus);

// -----------------------Update PaymentStatus---------------------------------

router.put ('/:orderId/payment-status', isAuthenticate, isAdmin, updatePaymentStatus)

// -------------------------------Order Cancel--------------------------------------

router.put ('/cancel-order/:orderId', isAuthenticate, cancelOrder);






export default router;
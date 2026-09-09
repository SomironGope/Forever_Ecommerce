import axios from "axios";
import { Order } from "../models/orderModels.js";
import validatePayment from '../utils/validatePayment.js';

import mongoose from "mongoose";

export const createPayment = async (req, res) => {
  try {
    const {orderId} = req.body;

    if(!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findById(orderId);

    if(!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Make sure this order belongs to the logged-in user
    if(order.userId.toString()  !== req.user._id.toString ()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to pay for this order",
      });
    }

    // Don't create another payment for an already-paid order

    if(order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }
    
    const data = {
      store_id : process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,

      total_amount: order.amount,
      currency: "BDT",

      tran_id: `ORDER_${order._id}`,

      success_url: `${process.env.BACKEND_URL}/api/v1/payment/sslcommerz/success`,

      fail_url: `${process.env.BACKEND_URL}/api/v1/payment/sslcommerz/fail`,

      cancel_url: `${process.env.BACKEND_URL}/api/v1/payment/sslcommerz/cancel`,

      ipn_url: `${process.env.BACKEND_URL}/api/v1/payment/sslcommerz/ipn`,

      cus_name: `${order.address.firstName} ${order.address.lastName}`,
      cus_phone: order.address.phone,

      cus_add1: order.address.street,
      cus_city: order.address.city,
      cus_postcode: order.address.postalCode,
      cus_country: order.address.country,

      shipping_method: "NO",
      product_name: "E-commerce Order",
      product_category: "General",
      product_profile: "general",
    };

    const response = await axios.post(
      `${process.env.SSLCOMMERZ_BASE_URL}/gwprocess/v4/api.php`,
      new URLSearchParams(data).toString(),

      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if(!response.data?.GatewayPageURL) {
      console.error("SSLCommerz response:", response.data);

      return res.status(400).json({
        success: false,
        message: "Failed to create SSLCommerz payment session",
        data: response.data,
      });
    }

    // Save payment provider
    order.paymentProvider = "SSLCOMMERZ";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "SSLCommerz payment session",
      orderId: order._id,
      paymentProvider: "SSLCOMMERZ",
      checkoutUrl: response.data.GatewayPageURL,
    });

  } catch (error) {
    console.error("SSLCommerz Create Payment Error:", error.response?.data || error.message);
    
    
    return res.status(500).json({
      success: false,
      message: "Failed to create payment"
    });
    
  }

}


export const sslcommerzSuccess = async (req, res) => {
  try {
    // ----- Transaction Id and Validate Id ------//

    const {tran_id, val_id} = req.body;

    if(!tran_id || !val_id) {
      return res.status(400).json({
        success: false,
        message: "missing transaction data",
      });
    }

   
    if(!tran_id.startsWith("ORDER_")) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }
   
    const orderId = tran_id.slice("ORDER_".length);
    //-------------MongoDB ObjectId Validation -------------
    
    if(!mongoose.Types.ObjectId.isValid (orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }
    
    // ----------Find Order ----------------

    const order = await Order.findById(orderId);

    if(!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
     
    // -----------------Check Already Paid----------------

    if(order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

     // --------------------Check Online -----------------------

    if(order.paymentMethod !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }
     
    // ------------------Check SSLCommerz ---------------------------

    if(order.paymentProvider && order.paymentProvider !== "SSLCOMMERZ") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment provider",
      });
    }

     // --------------- SSLCommerz Validation API -------------------

     const validationData = await validatePayment(val_id);
     
     // --------------Valid / Validated -----------------------

     const status = validationData.status?.toUpperCase();

    if(status !== "VALID" && 
      status !== "VALIDATED") {


        order.paymentStatus = "Failed";
        await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment validation failed",
      })
    }
    
    // -----------------Verify Transaction Id -----------------

    if(validationData.tran_id !== tran_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction mismatch",
      });
    }
   
    // --------------------Verify Amount ------------------------

    if(Number(validationData.amount) !== order.amount) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch"
      });
    }

    // ------------------Verify Currency -----------------------

    if(validationData.currency !== "BDT") {
      return res.status(400).json({
        success: false,
        message: "Invalid currency",
      });
    }
     
    // ---------------------Save Payment Information ---------------------

    order.paymentStatus = "Paid";
    order.paymentProvider = "SSLCOMMERZ";
    order.transactionId = tran_id;
    order.sslcommerzValId = val_id;
    order.bankTransactionId = validationData.bank_tran_id;

    // ----------------Paid Processing ------------------------------

    order.paidAt = new Date();
    order.orderStatus = "Processing";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });


  } catch (error) {
    console.error("SSLCommerz Success Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
}




export const sslcommerzFailed = async (req, res) => {
  try {
    // ----------- Transaction Id --------------

    const {tran_id} = req.body;

    if(!tran_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID missing",
      });
    }

    if(!tran_id.startsWith("ORDER_")) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }
    // -------------Check Order ----------------

    const orderId = tran_id.slice ("ORDER_".length);
   
    //-------------MongoDB ObjectId Validation -------------

    if(!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID",
      });
    }
     
    // ------------------Find Order--------------

    const order = await Order.findById(orderId);

    if(!order) {
      return res.status(404).json( {
        success: false,
        message: "Order not found",
      }); 
    }
    
    // -----------------Check Order Existence---------------

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

   // --------------Prevent Changing already paid order --------------
     
    order.paymentStatus  = "Failed";
    order.orderStatus = "Pending";
    
    // ---------------Save the Order-------------
    await order.save();
    
    // ---------------Return the proper response------------

    return res.status(200).json({
      success: true,
      message: "Payment Failed",
    });


    // -------------------Error Handling------------------

  } catch (error) {

    console.error("SSLCommerz Fail Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to handle payment failure",
    });
  }
}
 


export const sslcommerzCancel = async (req, res) => {
  try {
    
    const {tran_id} = req.body;

 if(!tran_id) {
  return res.status(400).json({
    success: false,
    message: "Transaction ID missing",
  });
 }

 if(!tran_id.startsWith("ORDER_")) {
  return res.status(400).json({
    success: false,
    message: "Invalid transaction ID",
  });
 }

 const orderId = tran_id.slice("ORDER_".length);

 if(!mongoose.Types.ObjectId.isValid(orderId)) {
  return res.status(400).json({
    success: false,
    message: "Invalid order ID",
  });
 }

 const order = await Order.findById(orderId)

 if(!order) {
  return res.status(404).json({
    success:false,
    message: "Order not found",
  });
 }

 if(order.paymentStatus === "Paid") {
  return res.status(400).json({
    success: false,
    message: "Order is already paid",
  });
 }

 order.paymentStatus = "Failed";
 order.orderStatus = "Pending";

 await order.save();

 return res.status(200).json({
  success: true,
  message: "Payment cancelled",
 });
 
  } catch (error) {
    console.error("SSLCommerz Cancel Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to handle payment cancellation",
    });
  }
}

export const sslcommerzIPN = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {tran_id, val_id} = req.body;

    if(!tran_id || !val_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction data missing",
      });
    }
    
     if(!tran_id.startsWith("ORDER_")) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
     }

     const orderId = tran_id.slice("ORDER_".length);

     if(!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
     }

     const order = await Order.findById(orderId);

     if(!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
     }
     
     if(order.paymentStatus === "Paid") {
      return res.status(200).json({
        success: true,
        message: "Order already processed",
      });
     }

     if(order.paymentMethod !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
     }

     if(order.paymentProvider && order.paymentProvider !== "SSLCOMMERZ") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment provider",
      });
     }
     
     const validationData = await validatePayment(val_id);
    // const validationData = {
    //   status: "VALID",
    //   tran_id: tran_id,
    //   amount: String(order.amount),
    //   currency: "BDT",
    //   bank_tran_id: "TEST_BANK_123"
    // }

    const status = validationData.status?.toUpperCase();

    if(status !== "VALID" && status !== "VALIDATED") {
      return res.status(400).json({
        success: false,
        message: "Payment validation failed",
      });
    }

    if(validationData.tran_id !== tran_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction mismatch",
      });
    }

    if(Number(validationData.amount) !== order.amount) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch",
      });
    }
    
    if(validationData.currency !== "BDT") {
      return res.status(400).json({
        success: false,
        message: "Invalid currency",
      });
    }

    order.paymentStatus = "Paid";
    order.paymentProvider = "SSLCOMMERZ";
    order.transactionId = tran_id;
    order.sslcommerzValId = val_id;
    order.bankTransactionId = validationData.bank_tran_id;
    order.paidAt = new Date();
    order.orderStatus = "Processing";


    await order.save();


    return res.status(200).json({
      success: true,
      message: "IPN payment verified successfully",
    });


  } catch (error) {

    console.error("SSLCommerz IPN Error:", error);

    return res.status(500).json({
      success: false,
      message: "IPN payment verification failed",
    });
  }
}
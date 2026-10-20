import axios from "axios";
import {Order} from '../models/orderModels.js';
import {Product} from '../models/productModels.js';
import {Cart} from '../models/cartModels.js';
import {User} from '../models/userModels.js';
import mongoose from "mongoose";
import { sendOrderConfirmationEmail } from "../emails/orderConfirmationEmail.js";



export const createMoyasarPayment = async (req, res) => {

  try {
    
    const { orderId } = req.body;

    const userId = req.user._id;

    // Check order ID-----

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      // --------------Find Order------------------

      const order = await Order.findOne ({
        _id: orderId,
        userId,
      });

      if (!order) {
        return res.status (404).json ({
          success: false,
          message: "Order not found",
        })
      }
    
      // ----------------Check payment method---------

      if (order.paymentMethod !== "ONLINE") {

        return res.status (400).json ({
          success: false,
          message: "This order is not an online payment order",
        })

      }



      // -----------------------Check payment provider--------------

      if (order.paymentProvider !== "MOYASAR") {

        return res.status(400).json ({
          success: false,
          message: "This order is not configured for Moyasar",
        })
      }
     
      // Prevent duplicate payment -----

      if (order.paymentStatus === "Paid") {
        return res.status(400).json ({
          success: false,
          message: "Order is already paid",
        })
      }
      

      // -------------------Create Moyasar Payment--------------------

      const response = await axios.post (
        "https://api.moyasar.com/v1/payments",
        {
          amount: order.amount * 100,
          currency: "SAR",
          description: `Forever Ecommerce Order ${order._id}`,

          callback_url: `${process.env.FRONTEND_URL}/payment/success`,

          source: {
            type: "creditcard",

            name: "Test User",
            number: "4111111111111111",
            month: "12",
            year: "2027",
            cvc: "123",
          },
        },

        {
          auth: {
            username: process.env.MOYASAR_SECRET_KEY,
            password: "",
          },
        }
      );

      // ------------------------------Save Moyasar Payment ID--------------------

      order.moyasarPaymentId = response.data.id;

      order.moyasarStatus = response.data.status;

      await order.save ();


      //----------------------- Response ------------------------------

      return res.status(200).json ({
        success: true,
        message: "Moyasar payment created",
        orderId: order._id,
        paymentId: response.data.id,
        paymentStatus: response.data.status,
        transactionUrl: response.data.source?.transaction_url,
        amount: order.amount 
      })







  } catch ( error ) {
    console.error ("Moyasar Payment Error:", error.response?.data || error.message);

    return res.status (500).json ({
      success: false,
      message: error.response?.data || error.message
    });
  }
  
};  

export const verifyMoyasarPayment = async (req, res) => {
  
  
     const session = await mongoose.startSession();

  try {


    const {paymentId} = req.body;

    const userId = req.user._id;


   // ------------------Check payment ID-------------------

   if (!paymentId) {
     return res.status (400).json ({
      success: false,
      message: "Payment ID is required",

     });
   }
  
   // -------------------Get payment from Moyasar--------------------------

   const response = await axios.get (`https://api.moyasar.com/v1/payments/${paymentId}`,
      {
        auth: {
          username: process.env.MOYASAR_SECRET_KEY,
          password: "",
        },
      }
   );


   const payment = response.data;

   console.log ("Moyasar payment:", payment);


   // -----------------Find Order-------------------

   const order = await Order.findOne ({
     moyasarPaymentId: paymentId,
     userId,
   });


   if (!order) {
     return res.status(404).json ({
      success: false,
      message: "Order not found for this payment",
     });
   }



   // ---------------------Already paid-----------------------------

   if (order.paymentStatus === "Paid") {
     return res.status (200).json ({
      success: true,
      message: "Order is already paid",
     });
   }



   // -------------------Check Moyasar status-----------------------------

   if (payment.status !== "paid") {
     
      order.moyasarStatus = payment.status;

      await order.save ();

      return res.status(400).json ({
        success: false,
        message: `Payment is not successfull. Current status: ${payment.status}`,
        paymentStatus: payment.status,
      });
   }



   // --------------------------Stat MongoDB Transaction-------------------//

   session.startTransaction ();

   // --------------------Check stock and reduce stock-----------------------

   for (const item of order.items) {

    const product = await Product.findById (item.productId).session(session);

    if (!product) {
      throw new Error (`Product not found: ${item.productId}`);
    }


    const selectedSize = product.sizes.find((sizeItem) => sizeItem.size === item.size);

    if (!selectedSize) {
       throw new Error (`Not enough stock for ${product.name}, size ${item.size}`);
    }
   
     
    if (selectedSize.stock < item.quantity) {

      throw new Error (`Not enough stock for ${product.name}, size ${item.size}`);
    }
    selectedSize.stock -= item.quantity;



    await product.save ({session});
   }


    // -------------------Update Order--------------------------------------

    order.paymentStatus = "Paid";

    order.paymentProvider = "MOYASAR";

    order.moyasarPaymentId = payment.id;

    order.moyasarStatus = payment.status;

    order.transactionId = payment.id;

    order.paidAt = new Date ();

    order.orderStatus = "Processing";


    await order.save ({session});


    //------------------------Clear Cart----------------------------


    await Cart.findOneAndUpdate (
      {userId},
      {$set: {items: [] }},
      {session}
    );


    // ---------------------------Commit Transaction---------------------

    await session.commitTransaction ();


   try {
      const user = await User.findById (userId).select("email firstName");
      
      if (user?.email) {
        await sendOrderConfirmationEmail(
          user.email,
          user.firstName,
          order,
        );
      }
   } catch (emailError) {
    console.error("Order confirmation email failed:",emailError )
   }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentStatus: payment.status,
      orderId: order._id,
      orderStatus: order.orderStatus,
    });


  } catch (error) {

   await session.abortTransaction();

    console.error ("Moyasar Verify Payment Failed:", error.response?.data || error.message);

    return res.status (500).json ({
      success: false,
      message: error.response?.data?.message || error.message
    })
  } finally {
    await session.endSession();
  }
}



export const refundMoyasarPayment = async (req, res) => {
  try {
    const { orderId} = req.params;

    const order = await Order.findById (orderId); 

    if (!order ) {
      return res.status (404).json ({
        success: false,
        message: "Order not found",
      });
    }

   
    // ----------------------Check Payment-----------------------------

    if (order.paymentMethod !== "ONLINE" || order.paymentProvider !== "MOYASAR") {

      return res.status(400).json ({
        success: false,
        message: "This order is not a Moyasar online payment"
      });
    }

    // ------------------------Check Payment Status-----------------------------
    
    if (order.paymentStatus === "Refunded") {
      return res.status(400).json({
        success: false,
        message: "This payment has already been refunded",
      });
    }

    if (order.paymentStatus !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid orders can be refunded",
      });
    }


    //-----------------------Check Moyasar Payment ID------------------

    if (!order.moyasarPaymentId) {
      return res.status(400).json({
        success: false,
        message: "Moyasar payment ID not found",
      });
    }

    // --------------------------Check Current Moyasar Payment------------------

    const paymentResponse = await axios.get (`https://api.moyasar.com/v1/payments/${order.moyasarPaymentId}`, 
    
     {
       auth: {
        username: process.env.MOYASAR_SECRET_KEY,
        password: "",
       },
     }
    );

    const payment = paymentResponse.data;

    console.log("Current Moyasar Payment:", payment);

    if (payment.status !== "paid" && payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Moyasar payment cannot be refunded. Current status: ${payment.status}`,
        paymentStatus: payment.status
      });
    }
    


    //-------------------------Refund Payment------------------------------

    const response = await axios.post (`https://api.moyasar.com/v1/payments/${order.moyasarPaymentId}/refund`,
      {},
      {
        auth: {
          username: process.env.MOYASAR_SECRET_KEY,
          password: "",
        },
      }   
    );

    console.log("Moyasar Refund Response:", response.data);

    // -----------------Update Order-------------------- 


    order.paymentStatus = "Refunded";
    order.orderStatus = "Cancelled";

    order.refundAmount = order.amount;
    order.refundReason = "Out of stock";
    order.refundedAt = new Date();

    order.moyasarStatus = response.data.status;

    

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Refund completed successfully",
    });

  } catch (error) {
    
     
     console.error("Refund Error:", error.response?.data || error.message);

      return res.status(error.response?.status || 500).json({
      success: false,
      message:
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.description ||
      error.message ||
      "Refund failed",
  });
  }
}
// import { Order } from "../models/orderModels.js";
// import stripe from "../config/stripe.js";

// Stripe acconunt for Internation Client

// export const createTestPayment = async (req, res) => {
//   try {
//     const {orderId} = req.body;

//     if(!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "Order Id required"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Test payment session created",
//       paymentProvider: "STRIPE",
//       orderId,
//       checkoutUrl: "Text_Stripe_Checkout",
//     });


//   } catch (error) {
//     console.log("Test payment error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }


// export const testPaymentSuccess = async (req, res) => {
//   try {
    
//     const {orderId} = req.body;
//     const order = await Order.findById(orderId);

//     if(!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     order.paymentStatus = "Paid";
//     order.paymentProvider = "STRIPE";
//     order.transactionId = `text_txn_${Date.now()}`;

//     await order.save();
    
//     return res.status(200).json({
//       success: true,
//       message: "Payment completed successfully",
//     });


//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }


// export const testPaymentFailed = async (req, res) => {
//   try {
//     const {orderId} = req.body;

//     const order = await Order.findById(orderId);

//     if(!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     order.paymentStatus = "Failed";
//     order.paymentProvider = "STRIPE";
//     order.transactionId = null;

//     await order.save();

//      return res.status(200).json({
//       success: true,
//       message: "Payment failed",
//       order,
//      });


//   } catch (error) {
//     console.error("Payment Failed Error:", error);

//     return res.status (500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }


// export const createStripeCheckout = async (req, res) => {
//   try {
//     const {orderId} = req.body;

//     if(!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "Order ID is required",
//       });
//     }

//     const order = await Order.findById(orderId);
//     if(!order) {
//       return res.status(400).json({
//         success: false,
//         message: "Order not found",
//       });
//     }
   
//      if(order.paymentStatus === "Paid") {
//       return res.status(400).json({
//         success: false,
//         message: "Order is already paid",
//       });
//      }

//      const session = await stripe.checkout.sessions.create({
//       mode: "payment",

//       line_items: order.items.map((item) => ({
//         price_data: {
//           currency: "sar",
//           product_data: {
//             name: item.name,

//           },
//           unit_amount: Math.round(item.price * 100),
//         },
//         quantity: item.quantity,
//       })),
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_}`,

//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,

//       metadata: {
//         orderId: order._id.toString(),
//       },

//      });

//      order.paymentProvider = "STRIPE",
//      await order.save();

//      return res.status(200).json({
//       success: true,
//       message: "Stripe Checkout session created",
//       sessionId: session.id,
//       checkoutUrl: session.url,
//      });



//   } catch (error) {
//     console.error("Stripe Checkout Error:", error);
    
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }

// export const stripeWebhook = async (req, res) => {

//   const sig = req.headers["stripe-signature"];

//   let event;


//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );

    
//   } catch (error) {
//     console.error("Stripe Webhook Signature Error:", error.message);

//     return res.status(400).send(
//       `Webhook Error: ${error.message}` 
//     );
//   }

//   try {
//     switch (event.type) {
//       case "checkout.session.completed": {
//         const session = event.data.object;

//         const orderId = session.metadata?.orderId;

//         if(!orderId) {
//           console.error ("Stripe webhook: orderId missing");
//           break;
//         }

//         const order = await Order.findById(orderId);

//         if(!order) {
//           console.error(`Stripe webhook: Order ${orderId} not found`);
//           break;
//         }

//         // Prevent duplicate processing
//         if(order.paymentStatus === "Paid") {
//           break;
//         }

//         order.paymentStatus = "Paid";
//         order.paymentProvider = "STRIPE";

//         order.transactionId = session.payment_intent || session.id;

//         order.orderStatus = "Processing";

//         await order.save();

//         console.log(`Stripe payment successful for order: ${orderId}`);

//         break;
//       }
//        default: console.log(`Unhandled Stripe event: ${event.type}`);
//     }

//     return res.status(200).json({
//       received: true,
//     });

//   } catch (error) {
//     console.error("Stripe Webhook Processing Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Webhook processing failed"
//     })
//   }
// }
import axios from "axios";
import { Order } from "../models/orderModels.js";
import { Product } from "../models/productModels.js";
import { Cart } from "../models/cartModels.js";
import { User } from "../models/userModels.js";
import mongoose from "mongoose";
import { sendOrderConfirmationEmail } from "../emails/orderConfirmationEmail.js";

// export const createMoyasarPayment = async (req, res) => {
//   try {
//     const { orderId } = req.body;

//     const userId = req.user._id;

//     // Check order ID-----

//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "Order ID is required",
//       });
//     }

//     // --------------Find Order------------------

//     const order = await Order.findOne({
//       _id: orderId,
//       userId,
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // ----------------Check payment method---------

//     if (order.paymentMethod !== "ONLINE") {
//       return res.status(400).json({
//         success: false,
//         message: "This order is not an online payment order",
//       });
//     }

//     // -----------------------Check payment provider--------------

//     if (order.paymentProvider !== "MOYASAR") {
//       return res.status(400).json({
//         success: false,
//         message: "This order is not configured for Moyasar",
//       });
//     }

//     // Prevent duplicate payment -----

//     if (order.paymentStatus === "Paid") {
//       return res.status(400).json({
//         success: false,
//         message: "Order is already paid",
//       });
//     }

//     // -------------------Create Moyasar Payment--------------------

//     const response = await axios.post(
//       "https://api.moyasar.com/v1/payments",
//       {
//         amount: order.amount * 100,
//         currency: "SAR",
//         description: `Forever Ecommerce Order ${order._id}`,

//         callback_url: `${process.env.FRONTEND_URL}/payment/success`,

//         source: {
//           type: "creditcard",

//           name: "Test User",
//           number: "4111111111111111",
//           month: "12",
//           year: "2027",
//           cvc: "123",
//         },
//       },

//       {
//         auth: {
//           username: process.env.MOYASAR_SECRET_KEY,
//           password: "",
//         },
//       },
//     );

//     // ------------------------------Save Moyasar Payment ID--------------------

//     order.moyasarPaymentId = response.data.id;

//     order.moyasarStatus = response.data.status;

//     await order.save();

//     //----------------------- Response ------------------------------

//     return res.status(200).json({
//       success: true,
//       message: "Moyasar payment created",
//       orderId: order._id,
//       paymentId: response.data.id,
//       paymentStatus: response.data.status,
//       transactionUrl: response.data.source?.transaction_url,
//       amount: order.amount,
//     });
//   } catch (error) {
//     console.error(
//       "Moyasar Payment Error:",
//       error.response?.data || error.message,
//     );

//     return res.status(500).json({
//       success: false,
//       message: error.response?.data || error.message,
//     });
//   }
// };



export const createMoyasarPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    // 1. Validate order ID
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "A valid order ID is required",
      });
    }

    // 2. Find order belonging to logged-in user
    const order = await Order.findOne({
      _id: orderId,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 3. Validate payment method
    if (order.paymentMethod !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "This order is not an online payment order",
      });
    }

    // 4. Validate payment provider
    if (order.paymentProvider !== "MOYASAR") {
      return res.status(400).json({
        success: false,
        message: "This order is not configured for Moyasar",
      });
    }

    // 5. Prevent payment for cancelled orders
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled orders cannot be paid",
      });
    }

    // 6. Prevent duplicate successful payment
    if (order.paymentStatus === "Paid") {
      return res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    // 7. Validate order amount
    const orderAmount = Number(order.amount);

    if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const amountInHalalas = Math.round(orderAmount * 100);

    // 8. Validate Moyasar secret key
    const secretKey = process.env.MOYASAR_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "Moyasar secret key is not configured",
      });
    }

    // 9. Check previous payment
    if (order.moyasarPaymentId) {
      let previousPayment;

      try {
        const previousResponse = await axios.get(
          `https://api.moyasar.com/v1/payments/${order.moyasarPaymentId}`,
          {
            auth: {
              username: secretKey,
              password: "",
            },
            timeout: 20000,
          }
        );

        previousPayment = previousResponse.data;

      } catch (error) {
        console.error(
          "Previous payment lookup failed:",
          error.response?.data || error.message
        );

        return res.status(502).json({
          success: false,
          message: "Unable to check previous payment. Please try again.",
        });
      }

      // Verify previous payment amount and currency
      if (
        previousPayment.amount !== amountInHalalas ||
        previousPayment.currency !== "SAR"
      ) {
        return res.status(409).json({
          success: false,
          message: "Previous payment details do not match this order",
        });
      }

      // Previous payment succeeded
      if (previousPayment.status === "paid") {
        order.moyasarStatus = previousPayment.status;
        await order.save();

        return res.status(409).json({
          success: false,
          message: "Payment already succeeded. Please verify the payment.",
          paymentId: previousPayment.id,
          paymentStatus: previousPayment.status,
        });
      }

      // Previous payment is still waiting
      if (previousPayment.status === "initiated") {
        return res.status(200).json({
          success: true,
          message: "An existing payment is waiting for completion",
          orderId: order._id,
          paymentId: previousPayment.id,
          paymentStatus: previousPayment.status,
          transactionUrl:
            previousPayment.source?.transaction_url || null,
          amount: order.amount,
        });
      }

      // Only confirmed failed payments can be retried
      if (previousPayment.status !== "failed") {
        return res.status(409).json({
          success: false,
          message: "Previous payment must be resolved before retrying",
          paymentStatus: previousPayment.status,
        });
      }

      order.moyasarStatus = previousPayment.status;
    }

    // 10. Development-only test card
    if (process.env.NODE_ENV === "production") {
      return res.status(400).json({
        success: false,
        message:
          "Production payment creation requires a secure customer payment source",
      });
    }

    // 11. Create Moyasar payment
    const response = await axios.post(
      "https://api.moyasar.com/v1/payments",
      {
        amount: amountInHalalas,
        currency: "SAR",
        description: `Forever Ecommerce Order ${order._id}`,
        callback_url: `${process.env.FRONTEND_URL}/payment/success`,

        source: {
          type: "creditcard",
          name: "Test User",
          number: "4111111111111111",
          month: 12,
          year: 2027,
          cvc: "123",
        },
      },
      {
        auth: {
          username: secretKey,
          password: "",
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const payment = response.data;

    // 12. Save payment details
    order.moyasarPaymentId = payment.id;
    order.moyasarStatus = payment.status;

    await order.save();

    // 13. Send response
    return res.status(200).json({
      success: true,
      message: "Moyasar payment created successfully",
      orderId: order._id,
      paymentId: payment.id,
      paymentStatus: payment.status,
      transactionUrl: payment.source?.transaction_url || null,
      amount: order.amount,
    });

  } catch (error) {
    console.error(
      "Moyasar Payment Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.description ||
        error.message ||
        "Unable to create Moyasar payment",
    });
  }
};




export const verifyMoyasarPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { paymentId } = req.body;
    const userId = req.user._id;

    // 1. Validate payment ID
    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid payment ID is required",
      });
    }

    // 2. Retrieve payment directly from Moyasar
    const response = await axios.get(
      `https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        auth: {
          username: process.env.MOYASAR_SECRET_KEY,
          password: "",
        },
        timeout: 20000,
      }
    );

    const payment = response.data;

    // 3. Find the customer's order
    const existingOrder = await Order.findOne({
      moyasarPaymentId: paymentId,
      userId,
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this payment",
      });
    }

    // 4. Validate payment amount and currency
    if (
      payment.amount !== Math.round(existingOrder.amount * 100) ||
      payment.currency !== "SAR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount or currency does not match the order",
      });
    }

    // 5. Handle unsuccessful payment
    if (payment.status !== "paid") {
      await Order.updateOne(
        {
          _id: existingOrder._id,
          userId,
          moyasarPaymentId: paymentId,
          paymentStatus: { $ne: "Paid" },
        },
        {
          $set: {
            moyasarStatus: payment.status,
          },
        }
      );

      return res.status(400).json({
        success: false,
        message: `Payment is not successful. Current status: ${payment.status}`,
        paymentStatus: payment.status,
      });
    }

    // 6. Process order inside a retryable transaction
    const transactionResult = await session.withTransaction(
      async () => {
        // Always reset these values because MongoDB may retry
        let processedNow = false;
        let emailOrder = null;

        // Re-read the order INSIDE the transaction
        const order = await Order.findOne({
          _id: existingOrder._id,
          userId,
          moyasarPaymentId: paymentId,
        }).session(session);

        if (!order) {
          throw new Error("Order not found during payment verification");
        }

        // Another request may already have completed verification
        if (order.paymentStatus === "Paid") {
          return {
            alreadyPaid: true,
            orderId: order._id,
          };
        }

        if (order.orderStatus === "Cancelled") {
          throw new Error("Cancelled orders cannot be processed");
        }

        // Prevent inconsistent duplicate stock deduction
        if (order.stockReduced) {
          throw new Error(
            "Stock was already reduced but the order is not marked as paid"
          );
        }

        // 7. Deduct stock from the selected variant and size
        for (const item of order.items) {
          const product = await Product.findById(item.productId).session(
            session
          );

          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          const selectedVariant = product.variants.find(
            (variant) =>
              variant._id.toString() === item.variantId.toString()
          );

          if (!selectedVariant) {
            throw new Error(
              `Selected product variant is no longer available: ${item.variantId}`
            );
          }

          const selectedSize = selectedVariant.sizes.find(
            (sizeItem) => sizeItem.size === item.size
          );

          if (!selectedSize) {
            throw new Error(
              `Size ${item.size} is no longer available`
            );
          }

          if (selectedSize.stock < item.quantity) {
            throw new Error(
              `Not enough stock for ${item.name}, size ${item.size}`
            );
          }

          selectedSize.stock -= item.quantity;

          await product.save({ session });
        }

        // 8. Update order payment details
        order.paymentStatus = "Paid";
        order.paymentProvider = "MOYASAR";
        order.moyasarStatus = payment.status;
        order.transactionId = payment.id;
        order.paidAt = new Date();
        order.orderStatus = "Processing";
        order.stockReduced = true;

        await order.save({ session });

        // 9. Clear database cart
        await Cart.findOneAndUpdate(
          { userId },
          { $set: { items: [] } },
          { session }
        );

        processedNow = true;
        emailOrder = order.toObject();

        return {
          alreadyPaid: false,
          processed: processedNow,
          orderId: order._id,
          orderStatus: order.orderStatus,
          emailOrder,
        };
      },
      {
        readPreference: "primary",
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
      }
    );

    // 10. Send confirmation email only for the request
    // that actually processed the order
    if (transactionResult?.processed) {
      try {
        const user = await User.findById(userId).select(
          "email firstName"
        );

        if (user?.email) {
          await sendOrderConfirmationEmail(
            user.email,
            user.firstName,
            transactionResult.emailOrder
          );
        }
      } catch (emailError) {
        console.error(
          "Order confirmation email failed:",
          emailError
        );
      }
    }

    // 11. Return successful verification
    return res.status(200).json({
      success: true,
      message: transactionResult?.alreadyPaid
        ? "Order is already paid"
        : "Payment verified successfully",
      paymentStatus: "Paid",
      orderId: transactionResult?.orderId,
      orderStatus: transactionResult?.orderStatus || "Processing",
    });

  } catch (error) {
    console.error(
      "Moyasar Verify Payment Failed:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.description ||
        error.message ||
        "Payment verification failed",
    });

  } finally {
    await session.endSession();
  }
};


export const refundMoyasarPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ----------------------Check Payment-----------------------------

    if (
      order.paymentMethod !== "ONLINE" ||
      order.paymentProvider !== "MOYASAR"
    ) {
      return res.status(400).json({
        success: false,
        message: "This order is not a Moyasar online payment",
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

    const paymentResponse = await axios.get(
      `https://api.moyasar.com/v1/payments/${order.moyasarPaymentId}`,

      {
        auth: {
          username: process.env.MOYASAR_SECRET_KEY,
          password: "",
        },
      },
    );

    const payment = paymentResponse.data;

    console.log("Current Moyasar Payment:", payment);

    if (payment.status !== "paid" && payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Moyasar payment cannot be refunded. Current status: ${payment.status}`,
        paymentStatus: payment.status,
      });
    }

    //-------------------------Refund Payment------------------------------

    const response = await axios.post(
      `https://api.moyasar.com/v1/payments/${order.moyasarPaymentId}/refund`,
      {},
      {
        auth: {
          username: process.env.MOYASAR_SECRET_KEY,
          password: "",
        },
      },
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
};

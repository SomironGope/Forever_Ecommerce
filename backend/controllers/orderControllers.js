import { Product } from "../models/productModels.js";
import { Order } from "../models/orderModels.js";
import { Cart } from "../models/cartModels.js";
import { User } from "../models/userModels.js";
import { sendOrderStatusEmail } from "../emails/sendOrderStatusEmail.js";
import mongoose from "mongoose";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { items, address, paymentMethod } = req.body;
    const userId = req.user._id;

    // Check order items
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Order items are required");
    }

    // Check payment method
    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      throw new Error("Invalid payment method");
    }

    // Check address
    if (
      !address ||
      !address.firstName?.trim() ||
      !address.lastName?.trim() ||
      !address.phone?.trim() ||
      !address.street?.trim() ||
      !address.city?.trim() ||
      !address.postalCode?.trim() ||
      !address.country?.trim()
    ) {
      throw new Error("Complete shipping address is required");
    }

    let amount = 0;
    const orderItems = [];

    // Calculate product total
    for (const item of items) {
      const { productId, variantId, quantity, size } = item;

      // Validate IDs
      if (
        !mongoose.isValidObjectId(productId) ||
        !mongoose.isValidObjectId(variantId)
      ) {
        throw new Error("Invalid product or variant ID");
      }

      // Validate quantity
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      if (!size || typeof size !== "string") {
        throw new Error("Valid size is required");
      }

      // Find product
      const product = await Product.findById(productId).session(session);

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      // Find selected color variant
      const selectedVariant = product.variants.find(
        (variant) => variant._id.toString() === variantId,
      );

      if (!selectedVariant) {
        throw new Error(`Selected color is not available for ${product.name}`);
      }

      // Find size inside selected variant
      const selectedSize = selectedVariant.sizes.find(
        (sizeItem) => sizeItem.size === size,
      );

      if (!selectedSize) {
        throw new Error(
          `Size ${size} is not available in ${selectedVariant.color?.name} for ${product.name}`,
        );
      }

      // Check stock
      if (selectedSize.stock < quantity) {
        throw new Error(
          `Only ${selectedSize.stock} items available in ${selectedVariant.color?.name}, size ${size}`,
        );
      }

      // Calculate item total
      const itemTotal = product.price * quantity;
      amount += itemTotal;

      // Get selected variant image
      const image =
        selectedVariant.images?.[0]?.url || product.productImg?.[0]?.url || "";

      // Save order item
      orderItems.push({
        productId: product._id,
        variantId: selectedVariant._id,
        name: product.name,
        image,
        colorName: selectedVariant.color?.name || "",
        colorHex: selectedVariant.color?.hex || "",
        price: product.price,
        quantity,
        size,
      });

      // Reduce stock immediately for COD orders
      if (paymentMethod === "COD") {
        selectedSize.stock -= quantity;
        await product.save({ session });
      }
    }

    // Delivery fee
    const deliveryFee = 15;

    // Payment information
    const paymentData =
      paymentMethod === "ONLINE"
        ? {
            paymentProvider: "MOYASAR",
            paymentStatus: "Pending",
          }
        : {
            paymentStatus: "Pending",
          };

    // Create order
    const order = await Order.create(
      [
        {
          userId,
          items: orderItems,
          amount: amount + deliveryFee,
          deliveryFee,
          address,
          paymentMethod,
          stockReduced: paymentMethod === "COD",
          ...paymentData,
        },
      ],
      { session },
    );

    // Clear database cart for COD orders
    if (paymentMethod === "COD") {
      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } },
        { session },
      );
    }

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message:
        paymentMethod === "COD"
          ? "Order created successfully"
          : "Order created. Proceed to payment",
      order: order[0],
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }
    // const order = await Order.findOne({ _id: orderId, userId: req.user._id });

    // Find only the authenticated user's order

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get Single Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order. Please try again later.",
    });
  }
};
// ========================Admin Controllers========================
export const getSingleOrderAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      "userId",
      "firstName lastName email",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: fasle,
      message: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    // Check order ID

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order Id",
      });
    }

    // Check Order Status
    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Find Order
    const order = await Order.findById(orderId).populate(
      "userId",
      "firstName email",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Save old Status

    const oldStatus = order.orderStatus;

    // Don't send email if status hasn't changed

    if (oldStatus === orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is already" + orderStatus,
      });
    }

    //Update status

    order.orderStatus = orderStatus;

    await order.save();

    // send status notification email/

    if (order.userId?.email) {
      try {
        console.log("Sending status email to:", order.userId.email);

        await sendOrderStatusEmail(
          order.userId.email,
          order.userId.firstName,
          order,
        );

        console.log("Status email sent successfully");
      } catch (emailError) {
        console.log("Order status email failed:", emailError.message);
      }
    }
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { paymentStatus } = req.body;

    // ---------------------Check Order Id ---------------------

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order Id",
      });
    }

    // -------------------Check Payment Status---------------------
    const validPaymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];

    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    // --------------Find Order-----------------------------

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ------------------------Don't allow cancelled order to become Paid

    if (order.orderStatus === "Cancelled" && paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be marked as paid",
      });
    }

    // ----------------Update payment status --------------------------

    order.paymentStatus = paymentStatus;

    if (paymentStatus === "Paid") {
      order.paidAt = new Date();
    } else {
      order.paidAt = null;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Customer Order Cancellation// Allow user to cancel an order before it is shipped

export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    }).session(session);

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "Pending") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }

    // Restore inventory only if stock was previously reduced
    if (order.stockReduced) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId).session(session);

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const selectedVariant = product.variants.find(
          (variant) => variant._id.toString() === item.variantId?.toString(),
        );

        if (!selectedVariant) {
          throw new Error(`Product variant not found for ${item.name}`);
        }

        const selectedSize = selectedVariant.sizes.find(
          (sizeItem) => sizeItem.size === item.size,
        );

        if (!selectedSize) {
          throw new Error(`Size ${item.size} not found for ${item.name}`);
        }

        selectedSize.stock += item.quantity;

        await product.save({ session });
      }

      order.stockReduced = false;
    }

    // Update Order

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();
    await order.save({ session });

    // everyThign succeeds
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    // Something failed or undo anything

    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ====================Get Payment Analytics========================

export const getPaymentAnalytics = async (req, res) => {
  try {
    const analytics = await Order.aggregate([
      {
        $facet: {
          // =================Payment Status=====================
          paymentStatus: [
            {
              $group: {
                _id: "$paymentStatus",
                count: { $sum: 1 },
                amount: { $sum: "$amount" },
              },
            },
            {
              $sort: { amount: -1 },
            },
          ],

          // ============================Payment Method===================

          paymentMethod: [
            {
              $group: {
                _id: "$paymentMethod",
                count: { $sum: 1 },
                amount: { $sum: "$amount" },
              },
            },
          ],

          //===================Payment Provider=========================

          paymentProvider: [
            {
              $match: {
                paymentProvider: { $ne: null },
              },
            },

            {
              $group: {
                _id: "$paymentProvider",
                amount: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
          ],

          // =======================Total Paid ========================

          totalPaid: [
            {
              $match: {
                paymentStatus: "Paid",
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
          ],

          // =====================Total Pending========================
          totalPending: [
            {
              $match: {
                paymentStatus: "Pending",
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
          ],

          // ==================Total Failed===============================

          totalFailed: [
            {
              $match: {
                paymentStatus: "Failed",
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
          ],

          // ================Total Refunded==============================

          totalRefunded: [
            {
              $match: {
                paymentStatus: "Refunded",
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$refundAmount" },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const data = analytics[0];

    return res.status(200).json({
      success: true,

      paymentStatus: data.paymentStatus,

      paymentMethod: data.paymentMethod,

      paymentProvider: data.paymentProvider,

      summary: {
        paid: data.totalPaid[0] || {
          amount: 0,
          count: 0,
        },

        pending: data.totalPending[0] || {
          amount: 0,
          count: 0,
        },

        failed: data.totalFailed[0] || {
          amount: 0,
          count: 0,
        },

        refunded: data.totalRefunded[0] || {
          amount: 0,
          count: 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

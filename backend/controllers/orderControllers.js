import {Product} from '../models/productModels.js'
import {Order} from '../models/orderModels.js';
import mongoose from 'mongoose';



export const createOrder = async (req, res) => {

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const {items, address, paymentMethod} = req.body;

    const userId = req.user._id;

    // Check items

    if(!items || items.length === 0) {
      throw new Error ("Order items are required");
     
    }

    // Check payment method

    if(!["COD","ONLINE"].includes(paymentMethod)) {
      
       throw new Error ("Invalid payment method")
    }
  
     let amount = 0;
     const orderItems = [];
       //-------------------Calculate product total-------------------
     for (const item of items) {
      const {productId, quantity, size} = item;

      // Check quantity

      if(!Number.isInteger(quantity) || quantity < 1) {
       throw new Error ("Quantity must be at least 1");
      }

      // Find product inside transction


      const product = await Product.findById(productId).session(session);

      if(!product) {
        throw new Error (`Product not found: ${productId}`);
      };

      // Check stock
      if(product.stock === 0) {
        throw new Error (`${product.name} is out of stock`);
      }

      if(product.stock < quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      };

      // Check size
      if(!size) {
        throw new Error(`Size is required for ${product.name}`);
      }
     
      if(!product.sizes.includes(size)) {
       throw new Error(`Invalid size for  ${product.name}`);
      }

      // Calculate item total
      const itemTotal = product.price * quantity;

       

      amount += itemTotal;
     

      // ----------------Add delivery Fee------------------------

     

      // Add order item

       orderItems.push ({
      productId: product._id,
      name: product.name,
      image: product.productImg[0]?.url || "",
      price: product.price,
      quantity,
      size

     });

     // Reduce stock 
     product.stock -= quantity;

     await product.save({session});
     }

     // Create order inside transction
     const deliverifyFee = 10;
     const order = await Order.create([
      {
        userId,
        items: orderItems,
        amount: amount + deliverifyFee,
        address,
        paymentMethod,
      },
     ],
     {session}
    );
    
    // Everything successful
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: order[0]
    });
    

  } catch (error) {

    // Something failed - undo everthing

    await session.abortTransaction();

    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    await session.endSession();
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({userId}).sort({createdAt: -1});


   return res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    orders,
   })
  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getSingleOrder = async (req, res) => {
  try {
    const {orderId} = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({_id: orderId, userId});

    if(!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });

  } catch (error) {
    console.error("Get Signle Order Error:", error)
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({createdAt: -1});

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


export const updateOrderStatus = async (req, res) => {
  try {
    const {orderId} = req.params;
    const {orderStatus} = req.body;

    // Check order ID

    if(!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order Id"
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
    const order = await Order.findById(orderId);

    if(!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update status
    order.orderStatus = orderStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const updatePaymentStatus = async (req, res) => {
  try {
    const {orderId} = req.params;

    const {paymentStatus} = req.body;

    // ---------------------Check Order Id ---------------------

    if(!mongoose.Types.ObjectId.isValid (orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order Id",
      });
    }
   
    // -------------------Check Payment Status---------------------
    const validPaymentStatuses = [
      "Pending",
      "Paid",
      "Failed",
      "Refunded",
    ];

    if(!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json ({
        success: false,
        message: "Invalid payment status"
      });
    }
  
    // --------------Find Order-----------------------------

    const order = await Order.findById (orderId);
 
    if(!order) {
      return res.status(404).json ({
        success: false,
        message: "Order not found",
      });
    }
   
    // ------------------------Don't allow cancelled order to become Paid

    if(order.orderStatus === "Cancelled" && paymentStatus === "Paid") {

      return res.status(400).json ({
        success: false,
        message: "Cancelled order cannot be marked as paid",
      });
    } 

    // ----------------Update payment status --------------------------

    order.paymentStatus = paymentStatus;

    if(paymentStatus === "Paid") {
      order.paidAt = new Date();
    }else {
      order.paidAt = null;
    };

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });


  } catch (error) {
    console.error("Update Payment Status Error:",error);
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


//Customer Order Cancellation// Allow user to cancel an order before it is shipped

export const cancelOrder = async (req, res) => {

  const session = await mongoose.startSession();

  try {
     session.startTransaction();


    const {orderId} = req.params;

    const order = await Order.findOne({_id:orderId, userId: req.user._id}).session(session);

    if(!order) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    
    if(order.orderStatus !== "Pending") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }
    
    // Restore inventory
    for(const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: item.quantity
          },
        },
        {
          session
        }
      );
    }


   // Update Order

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date()
    await order.save({session});

    
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
      message: error.message
    }); 
  }finally {
    await session.endSession()
  }
  
}




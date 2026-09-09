import mongoose from "mongoose";



const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      name: {
    type: String,
    required: true,
  },
   image: {
    type: String,
    required: true,
   },
  
   price: {
    type: Number,
    required: true,
   },
   quantity: {
    type: Number,
    required: true,
    min: 1,
   },
   
   size: {
    type: String,
    required: true,
   },

    },
    
  ],

  amount: {
    type: Number,
    required: true,
  },

  deliveryFee: {
    type: Number,
    default: 10,
  },

  address: {
    firstName: {type:String, required: true,},
    lastName: {type:String, required: true,},
    phone: {type:String, required: true,},
    street: {type:String, required: true,},
    city: {type:String, required: true,},
    postalCode: {type:String, required: true,},
    country: {type:String, required: true,},
  },
  
  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD",
    
  },

  paymentStatus: {
    type: String,
    enum: ["Pending","Paid", "Failed","Refunded"],
    default: "Pending",
  },
 
   paymentProvider: {
    type: String,
    enum: ["STRIPE", "SSLCOMMERZ","BKASH", "RAZORPAY"],
    default: undefined
   },

   transactionId: {
    type: String,
    default: null
   },
   
   sslcommerzValId: {
    type: String,
    default: null,
   },

   bankTransactionId: {
    type: String,
    default: null
   },
  
  orderStatus: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  
  paidAt: {
    type: Date,
    default: null,
  },

  cancelledAt: {
    type: Date,
  },

},
{timestamps: true}
);


export const Order = mongoose.model("Order", orderSchema);


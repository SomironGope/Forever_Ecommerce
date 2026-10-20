import mongoose from 'mongoose';


const cartSchema = new mongoose.Schema (
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,

    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },

        size: {
        type: String,
        required: true,

      },
      
      quantity: {
        type: Number,
        required: true,
        default: 1
      },

      },

      
    ],

  },
  {timestamps: true}
);


export const Cart = mongoose.model('Cart', cartSchema);
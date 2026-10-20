import mongoose from 'mongoose';



const reviewSchema = new mongoose.Schema (
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,

    },

    comment: {
      type: String,
      trim: true,
    },

    verifiedPurchase: {
      type: Boolean,
      default: false,

    },

    isApproved: {
      type: Boolean,
      default: true
    },
    helpfulCount: {
      type: Number,
      default: 0,
    }

  
},
 { timestamps: true }
);

// One review per user per product

reviewSchema.index (
  {productId: 1, userId: 1},
  { unique: true }
);

export const Review = mongoose.model("Review", reviewSchema);

import mongoose from "mongoose";

const wishListItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { _id: false }
);

const wishListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    products: {
      type: [wishListItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const WishList = mongoose.model("WishList", wishListSchema);

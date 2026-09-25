import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    oldPrice: {
      type: Number,
      default: 0,
    },

    sizes: [
      {
        size: { type: String, required: true, trim: true },

        stock: {
          type: Number,
          required: true,
          default: 0,
          min: 0,
        },
      },
    ],
    // Store array of objects for multiple images
    productImg: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);

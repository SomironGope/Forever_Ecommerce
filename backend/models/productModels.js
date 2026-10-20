import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: { 
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minLength: [2, "Product name must be at least 2 characters"],
      maxLength: [150, "Product name cannot exceed 150 characters"],
    },

    description: {
       type: String, 
       required: [true, "Product description is required"],
       trim: true,
       maxLength : [5000, "Description cannot exceed 5000 characters"],

       },

    category: { 
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxLength: [100, "Category cannot exceed 100 characters"],
    },

    subCategory: {
       type: String,
       required: [true, "Subcategory is required"],
       trim: true,
       maxLength: [100, "Subcategory cannot exceed 100 characters"],
      },

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

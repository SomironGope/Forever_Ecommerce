import mongoose from "mongoose";

// Product image schema
const productImageSchema = new mongoose.Schema(
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
  { _id: false },
);

// Size and stock schema
const variantSizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

// Color variant schema
const productVariantSchema = new mongoose.Schema(
  {
    color: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      hex: {
        type: String,
        required: true,
        trim: true,
        match: [/^#[0-9A-Fa-f]{6}$/, "Please provide a valid HEX color"],
      },
    },

    images: {
      type: [productImageSchema],
      default: [],
      validate: [
        {
          validator: (images) => Array.isArray(images) && images.length <= 5,
          message: "Each color can have a maximum of 5 images",
        },
      ],
    },

    sizes: {
      type: [variantSizeSchema],
      required: true,
      validate: {
        validator: (sizes) => sizes.length > 0,
        message: "Each color must have at least one size",
      },
    },
  },
  { _id: true },
);

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

    shortDescription: {
      type: String,
      trim: true,
      maxLength: [250, "Short description cannot exceed 250 characters"],
      default: "",
    },

    mediumDescription: {
      type: String,
      trim: true,
      maxLength: [1000, "Medium description cannot exceed 1000 characters"],
      default: "",
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxLength: [5000, "Description cannot exceed 5000 characters"],
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
      min: 0,
    },

    // New color-based variants
    variants: {
      type: [productVariantSchema],
      default: [],
    },

    // Legacy fields: retained for existing products
    colors: [
      {
        name: {
          type: String,
          trim: true,
        },
        hex: {
          type: String,
          trim: true,
        },
      },
    ],

    sizes: [
      {
        size: {
          type: String,
          trim: true,
        },
        stock: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    features: [
      {
        type: String,
        trim: true,
      },
    ],

    specifications: [
      {
        name: {
          type: String,
          trim: true,
        },
        value: {
          type: String,
          trim: true,
        },
      },
    ],

    careInstructions: {
      type: String,
      trim: true,
      default: "",
    },

    // Legacy product images
    productImg: {
      type: [productImageSchema],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);

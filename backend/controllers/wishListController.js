
import mongoose from "mongoose";
import { Product } from "../models/productModels.js";
import { WishList } from "../models/wishListModel.js";

// ---------------------- Add / Update Wishlist ----------------------

export const addToWishList = async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    const userId = req.id;

    if (
      !mongoose.isValidObjectId(productId) ||
      !mongoose.isValidObjectId(variantId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or variant ID",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const selectedVariant = product.variants.id(variantId);

    if (!selectedVariant) {
      return res.status(404).json({
        success: false,
        message: "Selected color variant not found",
      });
    }

    const wishList = await WishList.findOneAndUpdate(
      {
        userId,
        "products.productId": productId,
      },
      {
        $set: {
          "products.$.variantId": variantId,
        },
      },
      { returnDocument: "after"}
    );

    if (wishList) {
      return res.status(200).json({
        success: true,
        message: "Wishlist color updated successfully",
        wishList,
      });
    }

    const updatedWishList = await WishList.findOneAndUpdate(
      { userId },
      {
        $push: {
          products: { productId, variantId },
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      wishList: updatedWishList,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

// ---------------------- Get My Wishlist ----------------------
export const getMyWishList = async (req, res) => {
  try {
    const wishList = await WishList.findOne({
      userId: req.id,
    }).populate({
      path: "products.productId",
      select:
        "name shortDescription category subCategory price oldPrice variants productImg isFeatured",
    });

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishList: {
      products: wishList?.products || [],
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};
// -----------------------Remove From Wishlist ------------------------

export const removeFromWishList = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const wishList = await WishList.findOneAndUpdate(
      { userId: req.id },
      {
        $pull: {
          products: { productId },
        },
      },
      { returnDocument: "after"  }
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      wishList,
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
};

// ---------------------- Merge Guest Wishlist ----------------------

export const mergeGuestWishList = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: "Wishlist products must be an array",
      });
    }

    if (products.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Maximum 100 products can be merged",
      });
    }

    const uniqueProducts = new Map();

    for (const item of products) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !mongoose.isValidObjectId(item.variantId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or variant ID",
        });
      }

      uniqueProducts.set(String(item.productId), {
        productId: item.productId,
        variantId: item.variantId,
      });
    }

    if (uniqueProducts.size === 0) {
      return res.status(200).json({
        success: true,
        message: "No guest wishlist products to merge",
      });
    }

    const guestItems = [...uniqueProducts.values()];

    const existingProducts = await Product.find({
      _id: { $in: guestItems.map((item) => item.productId) },
    });

    const validItems = [];

    for (const item of guestItems) {
      const product = existingProducts.find(
        (product) =>
          product._id.toString() === item.productId.toString()
      );

      if (product && product.variants.id(item.variantId)) {
          validItems.push(item);
      }
    }

    const wishList = await WishList.findOneAndUpdate(
      { userId: req.id },
      {
        $setOnInsert: { userId: req.id },
      },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    for (const item of validItems) {
      const existingItem = wishList.products.find(
        (saved) =>
          saved.productId?.toString() === item.productId.toString()
      );

      if (existingItem) {
        existingItem.variantId = item.variantId;
      } else {
        wishList.products.push(item);
      }
    }

    await wishList.save();

    return res.status(200).json({
      success: true,
      message: "Guest wishlist merged successfully",
      wishList,
    });
  } catch (error) {
    console.error("Merge wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to merge guest wishlist",
    });
  }
};

// ---------------------- Check Wishlist ----------------------

export const checkWishList = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const wishList = await WishList.exists({
      userId: req.id,
      "products.productId": productId,
    });

    return res.status(200).json({
      success: true,
      isWishlisted: Boolean(wishList),
    });
  } catch (error) {
    console.error("Check wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
    });
  }
};

import { Product } from "../models/productModels.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import { Order } from "../models/orderModels.js";
import mongoose from "mongoose";

export const addProduct = async (req, res) => {
  const uploadedPublicIds = [];

  try {
    const {
      name,
      shortDescription,
      mediumDescription,
      description,
      category,
      subCategory,
      oldPrice,
      price,
      variants,
      features,
      specifications,
      careInstructions,
      isFeatured,
    } = req.body;

    // Parse JSON arrays from FormData
    const parseArray = (value, fieldName) => {
      if (!value) return [];

      try {
        const parsed = Array.isArray(value) ? value : JSON.parse(value);

        if (!Array.isArray(parsed)) {
          throw new Error();
        }

        return parsed;
      } catch {
        throw new Error(`Invalid ${fieldName} format`);
      }
    };

    // Parse request data
    const parsedVariants = parseArray(variants, "variants");
    const parsedFeatures = parseArray(features, "features");
    const parsedSpecifications = parseArray(specifications, "specifications");

    // Required field validation
    if (
      !name?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !subCategory?.trim() ||
      price === undefined ||
      price === "" ||
      parsedVariants.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required product fields",
      });
    }

    // Price validation
    const currentPrice = Number(price);

    const previousPrice =
      oldPrice === undefined || oldPrice === "" ? 0 : Number(oldPrice);

    if (
      !Number.isFinite(currentPrice) ||
      currentPrice <= 0 ||
      !Number.isFinite(previousPrice) ||
      previousPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product price",
      });
    }

    if (previousPrice > 0 && previousPrice <= currentPrice) {
      return res.status(400).json({
        success: false,
        message: "Old price must be greater than current price",
      });
    }

    // Validate variants
    const usedColors = new Set();

    for (const variant of parsedVariants) {
      const colorName = variant.color?.name?.trim();
      const colorHex = variant.color?.hex;

      if (
        !colorName ||
        typeof colorHex !== "string" ||
        !/^#[0-9A-Fa-f]{6}$/.test(colorHex)
      ) {
        return res.status(400).json({
          success: false,
          message: "Each variant must have a valid color name and HEX code",
        });
      }

      const normalizedColor = colorName.toLowerCase();

      if (usedColors.has(normalizedColor)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate color: ${colorName}`,
        });
      }

      usedColors.add(normalizedColor);

      // Validate image count for this color
      if (
        !Number.isInteger(variant.imageCount) ||
        variant.imageCount < 1 ||
        variant.imageCount > 5
      ) {
        return res.status(400).json({
          success: false,
          message: `${colorName} must have between 1 and 5 images`,
        });
      }

      // Validate sizes and stock
      if (!Array.isArray(variant.sizes) || variant.sizes.length === 0) {
        return res.status(400).json({
          success: false,
          message: `${colorName} must have at least one size`,
        });
      }

      const usedSizes = new Set();

      for (const item of variant.sizes) {
        const size = item.size?.trim();
        const stock = Number(item.stock);

        if (
          !size ||
          item.stock === "" ||
          item.stock === null ||
          item.stock === undefined ||
          !Number.isInteger(stock) ||
          stock < 0
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid size or stock for ${colorName}`,
          });
        }

        if (usedSizes.has(size.toLowerCase())) {
          return res.status(400).json({
            success: false,
            message: `Duplicate size ${size} for ${colorName}`,
          });
        }

        usedSizes.add(size.toLowerCase());
      }
    }

    // Verify total uploaded files
    const expectedImageCount = parsedVariants.reduce(
      (total, variant) => total + variant.imageCount,
      0,
    );

    if (!req.files || req.files.length !== expectedImageCount) {
      return res.status(400).json({
        success: false,
        message: "Uploaded images do not match the color variants",
      });
    }

    // Validate product features
    if (
      parsedFeatures.some((item) => typeof item !== "string" || !item.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product features",
      });
    }

    // Validate specifications
    if (
      parsedSpecifications.some(
        (item) => !item.name?.trim() || !item.value?.trim(),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product specifications",
      });
    }

    // Upload images separately for each color
    const productVariants = [];
    let fileIndex = 0;

    for (const variant of parsedVariants) {
      const variantImages = [];

      for (let i = 0; i < variant.imageCount; i++) {
        const file = req.files[fileIndex++];

        const fileUri = getDataUri(file);

        const result = await cloudinary.uploader.upload(fileUri.content, {
          folder: "mern_products",
          resource_type: "image",
        });

        uploadedPublicIds.push(result.public_id);

        variantImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }

      productVariants.push({
        color: {
          name: variant.color.name.trim(),
          hex: variant.color.hex.toUpperCase(),
        },

        images: variantImages,

        sizes: variant.sizes.map((item) => ({
          size: item.size.trim(),
          stock: Number(item.stock),
        })),
      });
    }

    // Featured product status
    const featured = isFeatured === true || isFeatured === "true";

    // Create product
    const firstVariant = productVariants[0];

    const newProduct = await Product.create({
      userId: req.id,

      name: name.trim(),

      shortDescription: shortDescription?.trim() || "",
      mediumDescription: mediumDescription?.trim() || "",
      description: description.trim(),

      category: category.trim(),
      subCategory: subCategory.trim(),

      price: currentPrice,
      oldPrice: previousPrice,

      variants: productVariants,

      // Temporary legacy fields for existing frontend compatibility
      colors: productVariants.map((item) => item.color),

      sizes: firstVariant.sizes,

      productImg: firstVariant.images,

      features: parsedFeatures.map((item) => item.trim()),

      specifications: parsedSpecifications.map((item) => ({
        name: item.name.trim(),
        value: item.value.trim(),
      })),

      careInstructions: careInstructions?.trim() || "",

      isFeatured: featured,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);

    // Clean up Cloudinary images if product creation fails
    if (uploadedPublicIds.length > 0) {
      await Promise.allSettled(
        uploadedPublicIds.map((publicId) =>
          cloudinary.uploader.destroy(publicId),
        ),
      );
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add product",
    });
  }
};

// Get all- products

export const getAlProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("userId", "firstName lastName email")
      .sort({ createAt: -1 });
    return res.status(201).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.log("GET ALL PRODUCTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSignleProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update Products

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const {
      name,
      shortDescription,
      mediumDescription,
      description,
      category,
      subCategory,
      price,
      oldPrice,
      variants,
      features,
      specifications,
      careInstructions,
      isFeatured,
    } = req.body;
    // -------------------Find User--------------

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ----------------Update basic products fields----------------
    if (name !== undefined) {
      product.name = name;
    }

    if (shortDescription !== undefined) {
      product.shortDescription = shortDescription;
    }

    if (mediumDescription !== undefined) {
      product.mediumDescription = mediumDescription;
    }

    if (description !== undefined) {
      product.description = description;
    }

    // -------------Update Features---------------
    if (features !== undefined) {
      let parsedFeatures;

      try {
        parsedFeatures =
          typeof features === "string" ? JSON.parse(features) : features;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid featured format",
        });
      }

      if (
        !Array.isArray(parsedFeatures) ||
        !parsedFeatures.every((item) => typeof item === "string")
      ) {
        return res.status(400).json({
          success: false,
          message: "Features must be an array of string",
        });
      }
      product.features = parsedFeatures
        .map((item) => item.trim())
        .filter(Boolean);
    }

    // ---------------Update Specifications--------------------

    if (specifications !== undefined) {
      let parsedSpecifications;

      try {
        parsedSpecifications =
          typeof specifications === "string"
            ? JSON.parse(specifications)
            : specifications;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid specifications format",
        });
      }
      if (
        !Array.isArray(parsedSpecifications) ||
        !parsedSpecifications.every(
          (item) =>
            item &&
            typeof item.name === "string" &&
            typeof item.value === "string",
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid specifications",
        });
      }

      product.specifications = parsedSpecifications.map((item) => ({
        name: item.name.trim(),
        value: item.value.trim(),
      }));
    }

    // ----------Update care instructions--------------
    if (careInstructions !== undefined) {
      if (typeof careInstructions !== "string") {
        return res.status(400).json({
          success: false,
          message: "Care instruction must be a string",
        });
      }
      product.careInstructions = careInstructions.trim();
    }

    if (category !== undefined) {
      product.category = category;
    }
    if (subCategory !== undefined) {
      product.subCategory = subCategory;
    }

    // ---------------Price Validation------------------

    const finalPrice = price !== undefined ? Number(price) : product.price;

    const finalOldPrice =
      oldPrice !== undefined ? Number(oldPrice) : product.oldPrice;

    // -----------------Validate Number----------------------

    if (Number.isNaN(finalPrice) || finalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price",
      });
    }

    if (Number.isNaN(finalOldPrice) || finalOldPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid old price",
      });
    }
    //----------------------If there is a discount, oldPrice must be greater than current price

    //-----------------------Old Price = 0 means no discount------------------

    //--------------------Update sizes and size stock-----------------------

    if (finalOldPrice > 0 && finalOldPrice <= finalPrice) {
      return res.status(400).json({
        success: false,
        message: "Old price must be greater than current price",
      });
    }

    product.price = finalPrice;
    product.oldPrice = finalOldPrice;

    // ---------------------------Sizes & Size Stock-------------------------

    let parsedVariants;

    if (variants !== undefined) {
      try {
        parsedVariants =
          typeof variants === "string" ? JSON.parse(variants) : variants;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid variants format",
        });
      }

      if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one product variant is required",
        });
      }

      const colorNames = parsedVariants.map((variant) =>
        variant.color?.name?.trim().toLowerCase(),
      );

      if (
        colorNames.some((name) => !name) ||
        new Set(colorNames).size !== colorNames.length
      ) {
        return res.status(400).json({
          success: false,
          message: "Duplicate colors are not allowed",
        });
      }

      const invalidVariant = parsedVariants.some((variant) => {
        if (
          !variant ||
          !variant.color ||
          typeof variant.color.name !== "string" ||
          !variant.color.name.trim() ||
          typeof variant.color.hex !== "string" ||
          !/^#[0-9A-Fa-f]{6}$/.test(variant.color.hex)
        ) {
          return true;
        }

        if (
          !Array.isArray(variant.images) ||
          variant.images.length < 1 ||
          variant.images.length > 5
        ) {
          return true;
        }

        const invalidImage = variant.images.some(
          (image) =>
            !image ||
            typeof image.url !== "string" ||
            !image.url.trim() ||
            typeof image.public_id !== "string" ||
            !image.public_id.trim(),
        );

        if (invalidImage) return true;

        if (!Array.isArray(variant.sizes) || variant.sizes.length === 0) {
          return true;
        }

        const invalidSize = variant.sizes.some(
          (item) =>
            !item ||
            typeof item.size !== "string" ||
            !item.size.trim() ||
            item.stock === undefined ||
            item.stock === null ||
            item.stock === "" ||
            !Number.isFinite(Number(item.stock)) ||
            Number(item.stock) < 0,
        );
        return invalidSize;
      });

      if (invalidVariant) {
        return res.status(400).json({
          success: false,
          message: "Invalid variant, image, size, or stock information",
        });
      }

      product.variants = parsedVariants.map((variant) => ({
        ...(variant._id ? { _id: variant._id } : {}),
        color: {
          name: variant.color.name.trim(),
          hex: variant.color.hex,
        },
        images: variant.images.map((image) => ({
          url: image.url.trim(),
          public_id: image.public_id.trim(),
        })),
        sizes: variant.sizes.map((item) => ({
          size: item.size.trim(),
          stock: Number(item.stock),
        })),
      }));
    }

    // -------------------------Featured product---------------------

    if (isFeatured !== undefined) {
      product.isFeatured = isFeatured === true || isFeatured === "true";
    }

    // ------------------------Save Product-----------------------------

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProductImage = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    // Find Product

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -----------Find selected color variant-------------
    const variant = product.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product color variant not found",
      });
    }

    // --------------Check files-------------

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    // ---------------------Maximum 5 images per color------------------

    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 images are allowed per color",
      });
    }

    // ------------------Keep old images temporarily-----------------

    const oldImages = [...variant.images];

    // ------------------Upload new images first----------------------
    const uploadImages = [];

    for (const file of req.files) {
      const fileUri = getDataUri(file);

      const result = await cloudinary.uploader.upload(fileUri.content, {
        folder: "mern_products",
        resource_type: "image",
      });

      uploadImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    // Update MongoDB

    variant.images = uploadImages;

    await product.save();

    // ----------------Delete old images after successful save ---------------

    await Promise.all(
      oldImages.map(async (image) => {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }),
    );

    return res.status(200).json({
      success: true,
      message: "Product variant images updated successfully",
      images: variant.images,
      product,
    });
  } catch (error) {
    console.error("Update product images error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find Product ID

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    
    // Collect images from every color variant


    const publicIds = [
      ...(product.variants || [] ).flatMap((variant) => 
      (variant.images || [] )
      .map((image) => image.public_id).filter(Boolean)
    ),
  ]


    // Include legacy product images if they still exist

    if ( product.productImg?.length > 0 ) {
      publicIds.push(
        ...product.productImg
        .map((image) => image.public_id)
        .filter(Boolean)
      );
    }
     
    // Remove duplicate IDs
    const uniquePublicIds = [...new Set(publicIds)];
    // Delete Product from MongoDB

    await Product.findByIdAndDelete(productId);

    // Delete Cloudinary images indenpendently

    const results = await Promise.allSettled(
      uniquePublicIds.map((publicId) => cloudinary.uploader.destroy(publicId)),
    );

    const successfulDeletions = results.filter(
      (result) => result.status === "fulfilled" && 
      result.value.result === "ok"
    );

    const failedDeletions = results.filter(
      (result) => result.status === "rejected" || 
      result.value.result !== "ok"
    );

    if (failedDeletions.length > 0 ) {
      console.error(
        "Some Cloudinary images could not be deleted:",
        failedDeletions,
      );
    }
    // -----------------Response ------------------
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      imageDeleted: successfulDeletions.length,
      imagesFailed: failedDeletions.length,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------------------- Latest Products List-----------------------------------

export const getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get latest products error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------Best Seller Products List ---------------------------------
export const getBestSellers = async (req, res) => {
  try {
    const bestSellers = await Order.aggregate([
      {
        $match: {
          orderStatus: {
            $nin: ["Cancelled"],
          },
        },
      },

      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.productId",
          totalSold: {
            $sum: "$items.quantity",
          },
        },
      },
      {
        $sort: {
          totalSold: -1,
        },
      },

      {
        $limit: 10,
      },
    ]);

    // No sales yet - use latest products as fallback

    if (bestSellers.length === 0) {
      const products = await Product.find().sort({ createAt: -1 }).limit(5);

      return res.status(200).json({
        success: true,
        count: products.length,
        products,
        fallback: true,
      });
    }

    const productIds = bestSellers.map((item) => item._id);

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    });

    // ----------------Keep products in the same order as totalSold

    const sortedProducts = productIds
      .map((id) =>
        products.find((product) => product._id.toString() === id.toString()),
      )
      .filter(Boolean);

    res.status(200).json({
      success: true,
      count: sortedProducts.length,
      products: sortedProducts,
    });
  } catch (error) {
    console.error("Get best sellers error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Recommended Product List

export const getRecommendedProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const products = await Product.find({
      _id: { $ne: currentProduct._id },

      category: currentProduct.category,
      subCategory: currentProduct.subCategory,
    }).limit(5);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Recommended Products Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Relative Product List

export const getRelativeProducts = async (req, res) => {
  try {
    console.log("Relative route hit");
    console.log("Params:", req.params);

    const { productId } = req.params;

    console.log("productId:", productId);

    const currentRelativeProduct = await Product.findById(productId);

    if (!currentRelativeProduct) {
      return res.status(404).json({
        success: false,
        message: "Relative product not found",
      });
    }

    const products = await Product.find({
      _id: {
        $ne: currentRelativeProduct._id,
      },

      category: currentRelativeProduct.category,
      subCategory: currentRelativeProduct.subCategory,
    }).limit(5);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Relative Product Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

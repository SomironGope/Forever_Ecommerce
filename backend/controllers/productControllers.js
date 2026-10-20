import { Product } from "../models/productModels.js"
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import {Order} from '../models/orderModels.js';
import mongoose from "mongoose";

export const addProduct = async (req, res) => {
  try {
   const {name,description,category,subCategory,oldPrice,price,sizes} = req.body;

   // Parse Size//

  

    let parsedSizes;

    try {
      parsedSizes = JSON.parse(sizes);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid sizes format"
      });
    }

   if (!name || !description || !category || !subCategory || !price || !parsedSizes || parsedSizes.length === 0) {
   
     return res.status(400).json({
      success: false,
      message: "All required fields are required",
     });
   };
    
   // Price validation

   if (oldPrice !== undefined && Number (oldPrice) > 0 && Number (oldPrice ) <= Number(price)) {
    return res.status (400).json({
      success: false,
      message: "Old price must be greater than current price"
    });
   }

   // Size and stock validation

   const invalidSize = parsedSizes.some((item) => 
     !item.size || item.stock === undefined || item.stock < 0
  
  );

  if (invalidSize) {
     return res.status (400).json({
      success: false,
      message: "Invalid size or stock"
     })
  }


   let productImg = [];

   // Multiple image upload

   if(req.files && req.files.length > 0) {
    for(const file of req.files) {

      const fileUri = getDataUri(file);
      
      const result = await cloudinary.uploader.upload(fileUri.content,{folder: "mern_products",resource_type: "image"});

      productImg.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
      
    }
   }

   // Create Product
   const newProduct = await Product.create({
    userId: req.id,
    name,
    description,
    category,
    subCategory,
    oldPrice: Number(oldPrice),
    price : Number(price),
    sizes: parsedSizes,
    productImg
   });

   return res.status(201).json({
    success: true,
    message: "Product added successfully",
    product: newProduct,
   });
     
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get all- products 

export const getAlProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("userId","firstName lastName email").sort({createAt: -1});
    return res.status(201).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {

    console.log("GET ALL PRODUCTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getSignleProduct = async (req, res) => {
  try {
    const {productId} = req.params;

   
    const product = await Product.findById(productId);

    if(!product) {
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
      message: error.message
    })
  }
}


// update Products

export const updateProduct = async (req, res) => {

 
  try {
    const {productId} = req.params;

    const {name, description, category, subCategory, price, oldPrice, sizes, isFeatured,} = req.body;
    // -------------------Find User--------------

    const product = await Product.findById(productId);

    if(!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    // ----------------Update basic products fields----------------
    if(name !== undefined) {
      product.name = name;
    }

    if(description !== undefined) {
      product.description = description;
    }

    if(category !== undefined) {
     product.category = category;
    } 
    if(subCategory !== undefined) {
     product.subCategory = subCategory;
    } 
    // -----------------------------------

    // ---------------Price Validation------------------
  
    
    const finalPrice = price !== undefined ? Number(price) : product.price;


    const finalOldPrice = oldPrice !== undefined ? Number (oldPrice) : product.oldPrice;


    
   // -----------------Validate Number----------------------

   if (Number.isNaN (finalPrice) || finalPrice < 0) {
    return res.status(400).json( {
      success: false,
      message: "Invalid price"
    })
   }


   if (Number.isNaN (finalOldPrice) || finalOldPrice < 0) {
    return res.status (400).json (
      {
        success: false,
        message: "Invalid old price"
      }
      
    );
   }
    //----------------------If there is a discount, oldPrice must be greater than current price

    //-----------------------Old Price = 0 means no discount------------------


    //--------------------Update sizes and size stock-----------------------
    if ( finalOldPrice > 0 && finalOldPrice <= finalPrice ) {

        return res.status(400).json({
          success: false,
          message: "Old price must be greater than current price"
        });
      }
    
     product.price = finalPrice;
     product.oldPrice = finalOldPrice;
      // ---------------------------Sizes & Size Stock-------------------------
    
          
      let parsedSizes;

if (sizes !== undefined) {
  try {
    parsedSizes =
      typeof sizes === "string"
        ? JSON.parse(sizes)
        : sizes;
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid sizes format",
    });
  }

  if (!Array.isArray(parsedSizes)) {
    return res.status(400).json({
      success: false,
      message: "Sizes must be an array",
    });
  }

  const invalidSize = parsedSizes.some(
    (item) =>
      !item.size ||
      item.stock === undefined ||
      Number(item.stock) < 0
  );

  if (invalidSize) {
    return res.status(400).json({
      success: false,
      message: "Invalid size or stock",
    });
  }

  product.sizes = parsedSizes.map((item) => ({
    size: item.size.trim(),
    stock: Number(item.stock),
  }));
}


//  console.log("req.body =", req.body);
// console.log("sizes =", req.body.sizes);
   // -------------------------Featured product---------------------

    if(isFeatured !== undefined) {
      product.isFeatured = isFeatured === true || isFeatured === "true";
    };

    // ------------------------Save Product-----------------------------

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });



  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const updateProductImage = async (req, res) => {

  try {
    const {productId} = req.params;

    // Find Product 

    const product = await Product.findById(productId);

    if(!product) {
      return res.status(404).json({
        success: false,
        true: "Product not found"
      });
    }

    // Check files

    if(!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image"
      });
    }
    console.log("Product ID:", productId);
console.log("Old images:", product.productImg);
console.log("Uploaded files:", req.files);
    // Delete old images from cloudinary

    if(product.productImg && product.productImg.length > 0) {
      await Promise.all(
        product.productImg.map(async (image) => {
          if(image.public_id) {
            await cloudinary.uploader.destroy(image.public_id);
          }
        })
      );
    }
  
     // Upload new images 
     const uploadImages = []; 

     for (const file of req.files) {

      const fileUri = getDataUri(file);

      const result = await cloudinary.uploader.upload (fileUri.content, 
      {
      folder: "mern_products",
      resource_type: "image",
      }
    );
     
    uploadImages.push ({
      url: result.secure_url,
      public_id: result.public_id,
    });


     }

     // Update MongoDB

     product.productImg = uploadImages;

     await product.save();

     return res.status(200).json({
      success: true,
      message: "Product images updated successfully",
      images: product.productImg,
      product,
     });

  } catch (error) {

    console.error("Update product images error:",error);
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const {productId} = req.params;
 
    // Validate product ID

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
 
    // Find Product ID

    const product = await Product.findById(productId);

    if(!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Save Cloudinary IDs before deleting the document

    const publicIds = ( product.productImg || [])
     .map((image) => image.public_id)
     .filter(Boolean);
     

    // Delete Product from MongoDB

    await Product.findByIdAndDelete(productId);


     // Delete Cloudinary images indenpendently

     const results = await Promise.allSettled(
      publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
     );

    
     const failedDeletations = results.filter ((result) => result.status === "rejected");

     if (failedDeletations) {
      console.error("Some Cloudinary images could not be deleted:", failedDeletations);
     }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      imageDeleted: results.length - failedDeletations.length,
      imagesFailed: failedDeletations.length,
    });

  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ----------------------------- Latest Products List-----------------------------------

export const getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find()
    .sort({createdAt: -1})
    .limit(10);
    
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });


  } catch (error) {
    console.error ("Get latest products error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    })


  }
} 


// --------------------------Best Seller Products List ---------------------------------
export const getBestSellers = async (req, res) => {
  try {
    const bestSellers = await Order.aggregate([
      {
        $match: {
          orderStatus: {
            $nin: ["Cancelled"]
          }
        }
      },

      {
        $unwind: "$items"
      },
       {
        $group: {
          _id: "$items.productId",
          totalSold: {
            $sum: "$items.quantity"
          }
        }
       },
       {
        $sort: {
          totalSold: -1
        }
       },

       {
        $limit: 10
       }
    ]);
     

    // No sales yet - use latest products as fallback

    if(bestSellers.length === 0) {
      const products = await Product.find()
      .sort({createAt: -1})
      .limit(5);

      return res.status(200).json({
        success: true,
        count: products.length,
        products,
        fallback: true
      });
    }



    const productIds = bestSellers.map((item) => item._id);

    const products = await Product.find({_id: {
      $in: productIds
    }
  });


  // ----------------Keep products in the same order as totalSold

  const sortedProducts = productIds.map((id) => products.find((product) => 
    product._id.toString() === id.toString()
  )
)
.filter(Boolean);

res.status(200).json({
  success: true,
  count: sortedProducts.length,
  products: sortedProducts,
});



  } catch (error) {

    console.error ("Get best sellers error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Recommended Product List

export const getRecommendedProducts = async (req, res) => {
  try {
    
    const {productId} = req.params;

    const currentProduct = await Product.findById (productId);

    if(!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const products = await Product.find({_id: {$ne: currentProduct._id},

      category: currentProduct.category,
      subCategory: currentProduct.subCategory
    
    }).limit(5);

      return res.status(200).json({
      success: true,
      count: products.length,
      products,

    });


  } catch (error) {
    console.error ("Get Recommended Products Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// Relative Product List

export const getRelativeProducts = async (req, res) => {
  try {
        console.log("Relative route hit");
    console.log("Params:", req.params);
    
    const {productId} = req.params;

    console.log("productId:", productId)

    const currentRelativeProduct = await Product.findById (productId);

    if(!currentRelativeProduct) {
      return res.status(404).json({
        success: false,
        message: "Relative product not found"
      })
    };

    const products = await Product.find({_id: 
      {
        $ne: currentRelativeProduct._id,
      },

      category: currentRelativeProduct.category,
      subCategory: currentRelativeProduct.subCategory
    }).limit(5);


    return res.status(200).json ({
      success: true,
      count: products.length,
      products
    });


  } catch (error) {
    console.error ("Get Relative Product Error:", error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
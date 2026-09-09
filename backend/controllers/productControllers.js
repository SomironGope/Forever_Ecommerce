import { Product } from "../models/productModels.js"
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import {Order} from '../models/orderModels.js';

export const addProduct = async (req, res) => {
  try {
   const {name,description,category,subCategory,price,stock,sizes} = req.body;

   if(!name || !description || !category || !subCategory || !price) {
    return res.status(400).json({
      success: false,
      message: "All required fields are required",
    });
   };
    
   // Convert Sizes from "S,M,L,XL" to ["S", "M", "L", "XL"]

   const sizeArray = sizes ? sizes.split(",").map((size) => size.trim()) : [];
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
    price,
    stock,
    sizes: sizeArray,
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

    const {name, description, category, subCategory, price, stock, sizes, isFeatured,} = req.body;

    const product = await Product.findById(productId);

    if(!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    // Update fields if provided
    if(name) product.name = name;
    if(description) product.description = description;
    if(category) product.category = category;
    if(subCategory) product.subCategory = subCategory;

    if(price !== undefined) product.price = price;
    if(stock !== undefined) product.stock = stock;

    if(sizes) {
      product.sizes = sizes
      .split(",").map((size) => size.trim());
    }


    if(isFeatured !== undefined) {
      product.isFeatured = isFeatured;
    }

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
      return res.status(500).json({
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

    // Delete old images from cloudinary

    if(product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (images) => {
          if(image.public_id) {
            await cloudinary.uploader.destroy(images.public_id);
          }
        })
      );
    }
  
     // Upload new images 
     const uploadImages = []; 

     for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
          folder: "Products",
          resource_type: "image",
        },
        (error, result) => {
          if(error) {
            reject(error);
          }else {
            resolve(result)
          }
        }
      );
      uploadStream.end(file.buffer);
      });
     }

     // Update MongoDB

     product.images = uploadImages;

     await product.save();

     return res.status(200).json({
      success: true,
      message: "Product images updated successfully",
      images: product.images,
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

    const product = await Product.findById(productId);

    if(!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }


    // Delete product images from Cloudinary
    if(product.images && product.images.length > 0) {
      await Promise.all( 
        product.images.map(async (image) => {
          if(image.public_id) {
            await cloudinary.uploader.destroy(image.public_id);
          }
        })
      );
    }

    // Delete Product from MongoDB

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
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
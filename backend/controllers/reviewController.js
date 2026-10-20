import { Order } from "../models/orderModels.js";
import { Product } from "../models/productModels.js";
import { Review } from "../models/reviewModels.js";


export const addReview = async (req, res) => {
  try {
   const  { productId, rating, comment} = req.body;

   const userId = req.user._id;

   //--------------Valid Product------------------
   const product = await Product.findById(productId);

   if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
   }

   // -------------------Validate rating---------------

   if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success:false,
      message: "Rating must be between 1 and 5",
    });
   }


   // Check if user already reviewed this product

   const existingReview = await Review.findOne({
    productId,
    userId,
   });


   if (existingReview) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this product",
    });
   }
    
   // Check whether user purchased and received this product

   const deliveredOrder = await Order.findOne({
    userId,
    orderStatus: "Delivered",
    "items.productId": productId,
   });

   const verifiedPurchase = !!deliveredOrder;

   // -------------Create review----------------

   const review = await Review.create({
    productId,
    userId,
    rating,
    comment,
    verifiedPurchase,

   });

   res.status(201).json({
    success: true,
    message: verifiedPurchase ? "Review added successfully as verified purchased" : "Review added successfully",
    review,
   });

  
  } catch (error) {
    console.error ("Add Review Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}



export const getProductReview = async (req, res) => {
  try {
   const { productId }  = req.params;

   const reviews = await Review.find({
    productId,
    isApproved: true,
   }).populate("userId", "firstName lastName profilePic").sort({createdAt: -1 });

   const totalReviews = reviews.length;

   const averageRating = totalReviews > 0 ? (
     reviews.reduce ((sum, review) =>sum + review.rating, 0) / totalReviews ).toFixed(1) : 0;


     res.status(200).json({
      success: true,
      totalReviews,
      averageRating,
      reviews,
     });



  } catch (error) {
    console.error("Get Product Review Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}



export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // ------------Find Review------------

    const review = await Review.findById (reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // ----------------Check review owner------------------

    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own review",
      });
    }


    // ------------Validate rating---------------

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }
    

    // -------------Update Fields-----------------

    if ( rating !== undefined) {
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    })
    
  }
}


export const deleteReview = async (req, res) => {

  try {

    const { reviewId } = req.params;

    // -----------Get logged in user's ID

    const userId = req.user._id;

    // --------------find Review-------------

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // --------------Check review owner---------------
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    await Review.findByIdAndDelete(reviewId);


    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
     
    });
    
  } catch (error) {
    console.error("Deleted Review Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    })
   
  }
}
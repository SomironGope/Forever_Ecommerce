import express from 'express';
import {isAuthenticate,isAdmin} from '../middleware/isAuthenticate.js'
import {addProduct, deleteProduct, getAlProducts, getBestSellers, getLatestProducts, getRecommendedProducts, getRelativeProducts, getSignleProduct, updateProduct, updateProductImage} from '../controllers/productControllers.js';
import { multipleUploadImg } from '../multer/Multer.js';

const router = express.Router();


// Add Products
router.post('/add-product',isAuthenticate,isAdmin,multipleUploadImg,addProduct);

// Get All Product List
router.get ('/all-product', getAlProducts);

// Latest Products
router.get ('/latest', getLatestProducts);

// Best Sellers Products
router.get ('/best-sellers', getBestSellers);

// Recommended products
router.get ('/recommended/:productId', getRecommendedProducts);

// Relative Products
router.get ('/relative/:productId', getRelativeProducts);

// Get Single Product
router.get ('/:productId', getSignleProduct);

// Update Product
router.put ('/:productId', isAuthenticate, isAdmin, updateProduct);

// Update Product Images
router.put ('/:productId/images',isAuthenticate,isAdmin,multipleUploadImg,updateProductImage);

// Delete Product
router.delete ('/:productId', isAuthenticate, isAdmin, deleteProduct);



export default router;
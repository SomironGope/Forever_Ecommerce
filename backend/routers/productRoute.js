import express from 'express';
import {isAuthenticate,isAdmin} from '../middleware/isAuthenticate.js'
import {addProduct, addProductVariantImages, deleteProduct, deleteProductVariantImage, getAlProducts, getBestSellers, getLatestProducts, getRecommendedProducts, getRelativeProducts, getSignleProduct, updateProduct, updateProductImage} from '../controllers/productControllers.js';
import { multipleUploadImg,addProductUpload } from '../multer/Multer.js';

const router = express.Router();


// Add Products
router.post('/add-product',isAuthenticate,isAdmin,addProductUpload,addProduct);


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

router.post('/:productId/variants/:variantId/images',isAuthenticate, isAdmin, multipleUploadImg, addProductVariantImages)

// Update Product Images
router.put ('/:productId/variants/:variantId/images',isAuthenticate,isAdmin,multipleUploadImg,updateProductImage);

// Delete Product Images

router.delete('/:productId/variants/:variantId/images', isAuthenticate, isAdmin, deleteProductVariantImage);
// Delete Product
router.delete ('/:productId', isAuthenticate, isAdmin, deleteProduct);




export default router;
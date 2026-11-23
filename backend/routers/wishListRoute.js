import express from 'express';
import { addToWishList, checkWishList, getMyWishList, mergeGuestWishList, removeFromWishList } from '../controllers/wishListController.js';
import {isAuthenticate} from '../middleware/isAuthenticate.js';

const wishListRouter = express.Router();

// All wishlit routes require authentication.

wishListRouter.use (isAuthenticate)


// Add product
wishListRouter.post ("/add", addToWishList);

wishListRouter.get ("/my-wishlist", getMyWishList);

// Remove from wishlist

wishListRouter.delete ("/remove/:productId", removeFromWishList);

// Merge guest wishlist

wishListRouter.post ("/merge", mergeGuestWishList);

// Check Product

wishListRouter.get ("/check/:productId", checkWishList);




export default wishListRouter;
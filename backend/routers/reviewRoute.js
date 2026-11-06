import express from 'express';
import { addReview, deleteReview, getProductReview, updateReview } from '../controllers/reviewController.js';
import { isAuthenticate } from '../middleware/isAuthenticate.js'


const reviewRouter = express.Router();


reviewRouter.post ('/add', isAuthenticate , addReview)

reviewRouter.get ('/product/:productId', getProductReview);

reviewRouter.put ('/:reviewId', isAuthenticate, updateReview);

reviewRouter.delete ('/:reviewId',isAuthenticate, deleteReview);






export default reviewRouter;




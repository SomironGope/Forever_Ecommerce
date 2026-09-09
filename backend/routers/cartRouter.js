import express from 'express';
import {addToCart, clearCart, getUserCart,removeFromCart, updateQuantity} from '../controllers/cartContronller.js';
import {isAuthenticate} from '../middleware/isAuthenticate.js';



const cartRouter = express.Router ();




// ------------------------Add Product to Cart ---------------------
cartRouter.post ('/add', isAuthenticate, addToCart);

// ----------------------Get User Cart-----------------------

cartRouter.get ('/my-cart', isAuthenticate, getUserCart);

// -------------------------Update Quantity---------------------------

cartRouter.put ('/update',isAuthenticate, updateQuantity);

// -------------------------Remove Product From Cart ----------------------

cartRouter.delete ('/remove', isAuthenticate, removeFromCart);

// ------------------------------Clear Cart------------------------------
cartRouter.delete ('/clear', isAuthenticate, clearCart);









export default cartRouter;
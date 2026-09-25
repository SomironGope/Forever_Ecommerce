import {Cart} from '../models/cartModels.js';
import { Product } from '../models/productModels.js';


export const addToCart = async (req, res) => {
  try{
    const {productId, size, quantity} = req.body;


    if (!size) {
      return res.status(400).json({
        success: false,
        message: "Please select a size"
      });
    }


    if(!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const userId = req.user._id;

     // ----------------Find Product-------------------
     const product = await Product.findById( productId );

     if(!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
     }


     // Find stock for selected size

     const selectedSize = product.sizes.find((item) => item.size === size);

     if (!selectedSize) {
      return res.status(400).json({
        success: false,
        message: "Selected size is not available"
      });
     }


     // Check Stock---


     if (selectedSize.stock < 1) {
      return res.status(400).json({
        success: false,
        message: `${size} size is out of stock`,
      });
     } 

   // -------------------Find user's cart---------------------
    let cart = await Cart.findOne ({ userId });


    if(!cart) {

       cart = new Cart ({
        userId,
        items: [],
       });

    }

   
    // -------------------Check whether same product + size already exists

    const existingItem = cart.items.find( 

      (item) => item.productId.toString() === productId && item.size === size);


     if(existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    // ------------Check size and Stock -----------------------

    if(newQuantity > selectedSize.stock) {

      return res.status(400).json({

        success: false,
        message: `Only ${selectedSize.stock} ${size} items are available in stock`,

      });
    }

      existingItem.quantity = newQuantity;


     } else {
      // ------------------Check size and specific stock----------------

      if(quantity > selectedSize.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${selectedSize.stock}  ${size} items are available in stock`,
        });
      }

      cart.items.push({
        productId,
        size,
        quantity,
      });

     }


      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
      });

    } catch(error){
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
  }






export const getUserCart = async  (req, res) => {
  try {

    const cart = await Cart.findOne ({
      userId: req.user._id,
    }).populate ("items.productId");

    res.status(200).json ({
      success: true,
      cart: cart || {items: []},
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }  
}




export const removeFromCart = async (req, res) => {
  try {
    
    const {productId, size } = req.body;

    const userId = req.user._id;

    const cart = await Cart.findOne ({userId});

    if(!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }


    cart.items = cart.items.filter ((item) => !(item.productId.toString() === productId && item.size === size))
    

    await cart.save();


    return res.status (200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart,
    });
    
  } catch (error) {
    return res.status(500).json ({
      success: false,
      message: error.message
    });
  }
}


export const updateQuantity = async (req, res) => {
  try {
      const {productId, size, quantity} = req.body;

      if(!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        })
      }

      const userId = req.user._id;
      
      const product = await Product.findById( productId );

     if(!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
     }

      const cart = await Cart.findOne ({userId});


      if(!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      const item = cart.items.find((item) => 
      item.productId.toString() === productId && item.size === size
    );



    if(!item) {

      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }


    const selectedSize = product.sizes.find((item) => item.size === size);

    if(!selectedSize) {
      return res.status (400).json({
        success: false,
        message: "Selected size is not available"
      });
    }

    if(quantity > selectedSize.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${selectedSize.stock} items are available in stock`,
      });

    }

    item.quantity = quantity;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
    });




  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}



// This removes all items from the logged in user's cart

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;


    await Cart.findOneAndUpdate(
    {userId},
    {$set: {items: [] } },
    {new: true}
  );
  



  return res.status(200).json({
    success: true,
    message: "Cart Clear successfully",
  });
    
  } catch (error) {

    console.error("Clear Cart Error:",error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
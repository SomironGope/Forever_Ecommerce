import mongoose from 'mongoose';
import {Cart} from '../models/cartModels.js';
import { Product } from '../models/productModels.js';


export const addToCart = async (req, res) => {
  try{
    const { productId, size, quantity } = req.body;
    const userId = req.user._id;

    // ---------------Validate Product ID----------------

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success:false,
        message: "Invalid product ID",
      })
    }


    if (typeof size !== "string" || !size.trim()) {
       return res.status(400).json({
        success: false,
        message: "Please select a size"
      });
    }

    const normalizedSize = size.trim();

    // Validate quantity

    if(!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    

     // ----------------Find Product-------------------
     const product = await Product.findById( productId );

     if(!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
     }


     // Find stock for selected size

     const selectedSize = product.sizes.find((item) => item.size === normalizedSize);

     // Reject missing or invalid stock

     if (!selectedSize || !Number.isSafeInteger(selectedSize.stock) || selectedSize.stock < 0 ) {
      return res.status(400).json({
        success: false,
        message: "Selected size is not available"
      });
     }


     // Reject out of stock size


     if (selectedSize.stock === 0) {
      return res.status(400).json({
        success: false,
        message: `${normalizedSize} size is out of stock`,
      });
     } 

   // -------------------Find or create user's cart---------------------
    let cart = await Cart.findOne ({ userId });


    if(!cart) {

        cart = new Cart ({
        userId,
        items: [],
       });

    }

   
    // ------------------- Find existing product + size 

    const existingItem = cart.items.find( 

      (item) => item.productId.toString() === productId && item.size === normalizedSize);

      // Calculate requested total quantity safely


     const currentQuantity = existingItem ? existingItem.quantity : 0;


    const newQuantity = currentQuantity + quantity;

    // ------------Check avaible  Stock -----------------------

    if(newQuantity > selectedSize.stock) {

      return res.status(400).json({

        success: false,
        message: `Only ${selectedSize.stock} ${normalizedSize} items are available in stock`,

      });
    }

    // Update or add item
    if (existingItem) {
      existingItem.quantity = newQuantity;
    }else {
      cart.items.push({
        productId,
        size: normalizedSize,
        quantity,
      });
    }

      // ------------------Check size and specific stock----------------

      // if(quantity > selectedSize.stock) {
      //   return res.status(400).json({
      //     success: false,
      //     message: `Only ${selectedSize.stock}  ${size} items are available in stock`,
      //   });
      // }
     


      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
      });

    } catch(error){

      console.error ("Add to cart error:", error);

      res.status(500).json({
      success: false,
      message: "Unable to add product to cart",
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


export const mergeGuestCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items } = req.body;

    // 1. Validate guest cart
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Guest cart is empty or invalid",
      });
    }

    if (items.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Too many cart items",
      });
    }

    // 2. Validate and combine duplicate product/size entries
    const mergedItems = new Map();

    for (const item of items) {
      const { productId, size, quantity } = item;

      if (
        !mongoose.isValidObjectId(productId) ||
        typeof size !== "string" ||
        !size.trim() ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid guest cart item",
        });
      }

      const key = `${productId}_${size.trim()}`;

      const previousQuantity = mergedItems.get(key)?.quantity || 0;
      const newQuantity = previousQuantity + quantity;

      if (!Number.isSafeInteger(newQuantity)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart quantity",
        });
      }

      mergedItems.set(key, {
        productId,
        size: size.trim(),
        quantity: newQuantity,
      });
    }

    // 3. Find all requested products
    const productIds = [
      ...new Set(
        [...mergedItems.values()].map((item) => item.productId)
      ),
    ];

    const products = await Product.find({
      _id: { $in: productIds },
    });

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    // 4. Get the user's existing database cart
    let cart = await Cart.findOne({ userId });

    // 5. Validate every guest item before changing the cart
    for (const guestItem of mergedItems.values()) {
      const product = productMap.get(guestItem.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "A product in your guest cart is no longer available",
        });
      }

      const selectedSize = product.sizes.find(
        (item) => item.size === guestItem.size
      );

      if (!selectedSize || selectedSize.stock < 1) {
        return res.status(400).json({
          success: false,
          message: `${product.name} in size ${guestItem.size} is unavailable`,
        });
      }

      const existingItem = cart?.items.find(
        (item) =>
          item.productId.toString() === guestItem.productId &&
          item.size === guestItem.size
      );

      const existingQuantity = existingItem?.quantity || 0;
      const totalQuantity = existingQuantity + guestItem.quantity;

      if (totalQuantity > selectedSize.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${selectedSize.stock} units of ${product.name} in size ${guestItem.size} are available`,
        });
      }
    }

    // 6. Create a cart if the user does not already have one
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // 7. Merge guest items into the database cart
    for (const guestItem of mergedItems.values()) {
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === guestItem.productId &&
          item.size === guestItem.size
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        cart.items.push(guestItem);
      }
    }

    // 8. Save the updated cart
    await cart.save();

    // 9. Return the updated cart with product details
    const updatedCart = await Cart.findById(cart._id).populate(
      "items.productId"
    );

    return res.status(200).json({
      success: true,
      message: "Guest cart merged successfully",
      cart: updatedCart,
    });

  } catch (error) {
    console.error("Merge Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to merge cart",
    });
  }
};
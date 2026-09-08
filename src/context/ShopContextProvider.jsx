import { ShopContext } from "./ShopContext"
 import { useEffect, useState } from "react";
//  import {products} from '../assets/products';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
 

  export const ShopContextProvider = (props) => {
    const currency = 'BDT'
    const delivery_fee = '10'

    const [user, setUser] = useState (null);
    const [products, setProducts] = useState ([]);
    const [latestProduct, setLatestProducts] = useState ([]);
    const [bestSellers, setBestSellers] = useState ([]);

    const [search, setSearch] = useState ('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems,setCartItems] = useState ({});
    const [token, setToken] = useState (localStorage.getItem('accessToken') || "");
    const navigate = useNavigate()


    // ---------------Add to Cart Functionality ------------------//

    const addToCart = async (itemId,size) => {
      
      if(!size) {
        toast.error('Select Product Size')
        return;
      // }else{
      //   toast.success('Added successfully')
      }
 
      if(!token) {
        toast.error ('Please login to first');
        navigate('/login');

        return;
      }
      

      try {
         const backendUrl = import.meta.env.VITE_BACKEND_URL;

         const response = await axios.post (`${backendUrl}/api/v1/cart/add`, {
          productId: itemId,
          size,
          quantity: 1,
         },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if(response.data.success) {

          let cartData = structuredClone (cartItems);

          if(!cartData[itemId]) {
            
            cartData[itemId] = {};
          }

          if(cartData[itemId][size]) {

            cartData[itemId][size] += 1;

          }else {

            cartData[itemId][size] = 1; 

          }

           setCartItems(cartData);

           toast.success('Product added to cart successfully');
        } 

      } catch (error) {
         console.log(error);

         toast.error (error.response?.data?.message || "Failed to add to product to cart")
      }



      let cartData = structuredClone(cartItems);

      if(cartData[itemId]) {
        if(cartData[itemId] [size]) {
          cartData[itemId] [size] += 1;
        }else {
          cartData[itemId] [size] = 1;
        }
      }
      else{
        cartData[itemId] = {};
        cartData [itemId] [size] = 1;
      }
      setCartItems(cartData)
    }
    
   // --------------Get User Cart Items from Backend -------------------------//

   



    useEffect (() => {

       const getUserCart = async () => {
      if (!token) {
        setCartItems({});
        return;
      }

     try {
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await axios.get (`${backendUrl}/api/v1/cart/my-cart`, {

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if(response.data.success && response.data.cart) {

        const cartData = {};

        response.data.cart.items.forEach ((item) => {
          const productId = item.productId._id;

          if(!cartData[productId]) {
            cartData[productId] = {};
          }

          cartData[productId][item.size] = item.quantity;
        });

        setCartItems (cartData);

      
      } else {
        setCartItems ({});
      }
      
     }catch (error) {
      console.log(error);
      toast.error (error.response?.data?.message || 'Failed to fetch cart items');
     }
    }
      getUserCart();
    }, [token]);




    useEffect (() => {
      console.log(cartItems)

    },[cartItems])


   const getCartCount = () => {
    
    let totalCount = 0;

    for(const items in cartItems) {
      for(const item in cartItems[items]){
        try {
          if(cartItems[items][item] > 0 ){
            totalCount += cartItems[items][item]
          }
        } catch (error) {
          toast.error('something went wrong')
          console.log(error)
        }
      }
    }
    return totalCount;
   }

      //   --------------Updates Quantity and Modify  ---------------------//


      
         
        const updateQuantity = async (itemId, size, quantity) => {
          try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await axios.put(`${backendUrl}/api/v1/cart/update`, 
              {
                productId: itemId,
                size,
                quantity,
              },
              {
               headers: {
                Authorization: `Bearer ${token}`,
              },
              }
            );

            if(response.data.success) {
              const cartData = structuredClone(cartItems);

              cartData[itemId][size] = quantity;

              setCartItems(cartData);

            }
          } catch (error) {
            console.log(error)
          }
        };

       
        
   

      // const updateQuantity = async (itemId,size,quantity) => {
      //   let cartData = structuredClone(cartItems);

      //   cartData[itemId][size] = quantity;

      //   setCartItems(cartData);
      // }



       // -------------------Total Cart Amount --------------------------//

       const getCartAmount =  () => { 

        let totalAmount = 0;

        for(const itemId in cartItems){ 
          let itemInfo = products.find((product) => product._id === itemId);

         if(!itemInfo) continue;

         for (const size in cartItems[itemId]) {
          const quantity = cartItems[itemId][size];

          if(quantity > 0) {
            totalAmount += itemInfo.price * quantity;
          }
         }
        }
        return totalAmount;
       }


     // -------------------Remove Item from Cart ---------------------------//
     
      
        
     const removeFromCart = async (itemId, size) => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const  response = await axios.delete (`${backendUrl}/api/v1/cart/remove`, {
          data: {
            productId: itemId,
            size,
          },
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        if(response.data.success) {
          const cartData = structuredClone(cartItems);

          if(cartData[itemId]) {
            delete cartData[itemId] [size];

            if(Object.keys(cartData[itemId]).length === 0) {
              delete cartData[itemId];
            }
          }

          setCartItems(cartData)

          toast.success("Product removed from cart");
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message)
      }
     }
        
    



       
      // --------------------Get Product Data from Backend ---------------------//
    useEffect (() => {

      const getProductData = async () => {

        const backendUrl = import.meta.env.VITE_BACKEND_URL
        try {

          const [allProductsResponse,
            latestProductsResponse,
            bestSellersResponse
          ] =  await Promise.all ([
             axios.get(`${backendUrl}/api/v1/product/all-product`),

             axios.get (`${backendUrl}/api/v1/product/latest`),

             axios.get (`${backendUrl}/api/v1/product/best-sellers`),
            
          ]);

          console.log("All Products:", allProductsResponse.data);
          console.log("Latest Products:", latestProductsResponse);
          console.log("Best Sellers:", bestSellersResponse);



          if(allProductsResponse.data.success) {
            setProducts(allProductsResponse.data.products);
          }
          
          if(latestProductsResponse.data.success) {
            setLatestProducts (latestProductsResponse.data.products);
          }


          if(bestSellersResponse.data.success) {
            setBestSellers(bestSellersResponse.data.products);
          }



        } catch (error) {
          console.log(error);

          toast.error(error.response?.data?.message || "Failed to load products")
        }
       }
      getProductData()
    },[])


   


    const value = {
      token,
      setToken,
      user,
      setUser,
       products,
       currency,
       delivery_fee,
       search,
       setSearch,
       showSearch,
       setShowSearch,
       cartItems,
       setCartItems,
       addToCart,
       getCartCount,
       removeFromCart,
       updateQuantity,
       getCartAmount,
       navigate,
       latestProduct,
       bestSellers
      
       
    }
    return (
      <ShopContext.Provider value={value}>
        {props.children}
      </ShopContext.Provider>
    )
    
  }




export default ShopContextProvider;

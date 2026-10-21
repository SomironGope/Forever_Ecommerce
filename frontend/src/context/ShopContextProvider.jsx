import { ShopContext } from "./ShopContext"
 import api,{setAccessTokenUpdater} from "../utils/axiosInstance";
 import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

 

  export const ShopContextProvider = (props) => {
    const currency = '⃁'
    const delivery_fee = '15'

    const [user, setUser] = useState (null);
    const [products, setProducts] = useState ([]);
    const [latestProduct, setLatestProducts] = useState ([]);
    const [bestSellers, setBestSellers] = useState ([]);

    const [search, setSearch] = useState ('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems,setCartItems] = useState ({});
    const [token, setToken] = useState (localStorage.getItem('accessToken') || "");

    const [authReady, setAuthReady] = useState (false);
    const navigate = useNavigate();



   
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // ---------------Add to Cart Functionality ------------------//

   
const addToCart = async (itemId, size) => {
  // Validate size
  if (!size) {
    toast.error("Select Product Size");
    return;
  }

  // Check login
  if (!token) {
    toast.error("Please login first");
    navigate("/login");
    return;
  }

  try {
    

    const response = await api.post(
      "/api/v1/cart/add",
      {
        productId: itemId,
        size,
        quantity: 1,
      },
    
    );

    // Update cart only if backend confirms success
    if (response.data.success) {
      setCartItems((prevCart) => {
        const cartData = structuredClone(prevCart);

        if (!cartData[itemId]) {
          cartData[itemId] = {};
        }

        cartData[itemId][size] =
          (cartData[itemId][size] || 0) + 1;

        return cartData;
      });

      toast.success(
        response.data.message ||
        "Product added to cart successfully"
      );
    }
  } catch (error) {
    console.error("Add to cart error:", error);

    toast.error(
      error.response?.data?.message ||
      "Failed to add product to cart"
    );
  }
};

    
   // --------------Get User Cart Items from Backend -------------------------//

// ---------------------------RefreshToken ----------------------------------   

useEffect(() => {
  let cancelled = false;

  const restoreSession = async () => {
    try {
      const response = await api.post(
        "/api/v1/user/refresh",
        {},
        { withCredentials: true }
      );

      if (cancelled) return;

      if (response.data.success && response.data.accessToken) {
        const newToken = response.data.accessToken;

        localStorage.setItem("accessToken", newToken);
        setToken(newToken);
      } else {
        localStorage.removeItem("accessToken");
        setToken("");
      }
    } catch (error) {
      if (cancelled) return;

      // Refresh failed: don't reuse the expired access token.
      localStorage.removeItem("accessToken");
      setToken("");

      if (error.response?.status !== 401) {
        console.error(
          "Session restoration failed:",
          error.response?.data || error.message
        );
      }
    } finally {
      if (!cancelled) {
        setAuthReady(true);
      }
    }
  };

  restoreSession();

  return () => {
    cancelled = true;
  };
}, []);


     // -------------------------Get My Cart------------------------------
    useEffect (() => {

      if (!authReady)  return;

       const getUserCart = async () => {
      if (!token) {
        setCartItems({});
        return;
      }

     try {
      
     

      const response = await api.get ("/api/v1/cart/my-cart");

      if(response.data.success && response.data.cart) {

        const cartData = {};

        response.data.cart.items.forEach ((item) => {

          if (!item.productId) return;
          
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
    
      toast.error (error.response?.data?.message || 'Failed to fetch cart items');
     }
    }
      getUserCart();
    }, [token, authReady]);



    useEffect (() => {
  setAccessTokenUpdater(setToken);

  return () => {
    setAccessTokenUpdater (() => {});
  };
    }, []);



    // ---------------------Cart Items Count-------------------------------

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
          

            const response = await api.put("/api/v1/cart/update", 
              {
                productId: itemId,
                size,
                quantity,
              },
              
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
        

        const  response = await api.delete (`/api/v1/cart/remove`, {
          data: {
            productId: itemId,
            size,
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

       
        try {

          const [allProductsResponse,
                latestProductsResponse,
                bestSellersResponse
          ] =  await Promise.all ([
             api.get("/api/v1/product/all-product"),

             api.get ("/api/v1/product/latest"),

             api.get ("/api/v1/product/best-sellers"),
            
          ]);


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

// ----------------------------------Get User Profile------------------------------

   useEffect (() => {
   
       const getUserProfile = async () => {
     try {
      if(!token) {
        setUser (null);
        return;
      }

      const response = await api.get("/api/v1/user/profile",);


    if(response.data.success) {
      setUser (response.data.user);

    }
     } catch (error) {
      
      console.log("Profile Error:", error);
     }
     }

     getUserProfile();
     
   },[token])
   

   // ---------------------------------------Log out --------------------------------

   const logout = async () => {

    try {
      
      const response = await api.post ("/api/v1/user/logout",
        {},
        {withCredentials: true}
      );

      if (response.data.success) {
        
        // Clear the frontend authentication state
         
         localStorage.removeItem("accessToken");
         setToken ("");
         setUser(null);
         setCartItems({});
         toast.success ("Logged out successfully");
         
         return false;
      }

    } catch (error) {
      console.error("Logout API error:", error.response?.data || error.message);
      
    }   
   }


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
       bestSellers,
       backendUrl,
       logout
      
       
    }
    return (
      <ShopContext.Provider value={value}>
        {props.children}
      </ShopContext.Provider>
    )
    
  }




export default ShopContextProvider;

import { ShopContext } from "./ShopContext";
import api, { setAccessTokenUpdater } from "../utils/axiosInstance";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SaudiRiyal from "../components/SaudiRiyal";


export const ShopContextProvider = (props) => {
  const currency = <SaudiRiyal />;
  const delivery_fee = "15";

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [latestProduct, setLatestProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

   const [token, setToken] = useState(localStorage.getItem("accessToken") || "");

  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;



  const [cartItems, setCartItems] = useState(() => {
    try{
      const savedCart = localStorage.getItem("guestCart");
      return savedCart ? JSON.parse(savedCart) : {};

    } catch (error ) {
      console.error ("Error parsing guest cart from localStorage:", error);
      return {};
    }
  });

 useEffect (() => {
  if (!token) {
    localStorage.setItem("guestCart", JSON.stringify(cartItems));
  }
 },[cartItems,token]);

  // ---------------Add to Cart Functionality ------------------//

 
 
const addToCart = async (itemId, variantId, size) => {
  if (!variantId || !size) {
    toast.error("Please select a color and size.");
    return;
  }

  // Guest customer
  if (!token) {
    setCartItems((prevCart) => {
      const cartData = structuredClone(prevCart);

      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }

      if (!cartData[itemId][variantId]) {
        cartData[itemId][variantId] = {};
      }

      cartData[itemId][variantId][size] =
        (cartData[itemId][variantId][size] || 0) + 1;

      return cartData;
    });

    toast.success("Product added to cart successfully");
    return;
  }

  // Logged-in customer
  try {
    const response = await api.post("/api/v1/cart/add", {
      productId: itemId,
      variantId,
      size,
      quantity: 1,
    });

    if (response.data.success) {
      setCartItems((prevCart) => {
        const cartData = structuredClone(prevCart);

        if (!cartData[itemId]) {
          cartData[itemId] = {};
        }

        if (!cartData[itemId][variantId]) {
          cartData[itemId][variantId] = {};
        }

        cartData[itemId][variantId][size] =
          (cartData[itemId][variantId][size] || 0) + 1;

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


  // ---------------------------RefreshToken ----------------------------------

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const response = await api.post(
          "/api/v1/user/refresh",
          {},
          { withCredentials: true },
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
            error.response?.data || error.message,
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

useEffect(() => {
  if (!authReady || !token) return;

  const getUserCart = async () => {
    try {
      const response = await api.get("/api/v1/cart/my-cart");

      if (response.data.success && response.data.cart) {
        const cartData = {};

        response.data.cart.items.forEach((item) => {
          if (!item.productId || !item.variantId) return;

          const productId = item.productId._id;
          const variantId = item.variantId.toString();

          if (!cartData[productId]) {
            cartData[productId] = {};
          }

          if (!cartData[productId][variantId]) {
            cartData[productId][variantId] = {};
          }

          cartData[productId][variantId][item.size] = item.quantity;
        });

        setCartItems(cartData);
      }
    } catch (error) {
      console.error(
        "Get cart error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch cart items"
      );
    }
  };

  getUserCart();
}, [token, authReady]);

  useEffect(() => {
    setAccessTokenUpdater(setToken);

    return () => {
      setAccessTokenUpdater(() => {});
    };
  }, []);

  // ---------------------Cart Items Count-------------------------------

const getCartCount = () => {
  let totalCount = 0;

  for (const productId in cartItems) {
    for (const variantId in cartItems[productId]) {
      for (const size in cartItems[productId][variantId]) {
        const quantity = cartItems[productId][variantId][size];

        if (quantity > 0) {
          totalCount += quantity;
        }
      }
    }
  }

  return totalCount;
};

  //   --------------Updates Quantity and Modify  ---------------------//


const updateQuantity = async (itemId, variantId, size, quantity) => {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return;

  // Guest customer
  if (!token) {
    setCartItems((prevCart) => {
      const cartData = structuredClone(prevCart);

      if (
        cartData[itemId]?.[variantId]?.[size] === undefined
      ) {
        return prevCart;
      }

      cartData[itemId][variantId][size] = quantity;

      return cartData;
    });

    return;
  }

  // Logged-in customer
  try {
    const response = await api.put("/api/v1/cart/update", {
      productId: itemId,
      variantId,
      size,
      quantity,
    });

    if (response.data.success) {
      setCartItems((prevCart) => {
        const cartData = structuredClone(prevCart);

        if (
          cartData[itemId]?.[variantId]?.[size] === undefined
        ) {
          return prevCart;
        }

        cartData[itemId][variantId][size] = quantity;

        return cartData;
      });
    }
  } catch (error) {
    console.error("Update cart error:", error);

    toast.error(
      error.response?.data?.message || "Failed to update cart"
    );
  }
};


 const getCartAmount = () => {
  let totalAmount = 0;

  for (const itemId in cartItems) {
    const itemInfo = products.find(
      (product) => product._id?.toString() === itemId.toString()
    );

    if (!itemInfo) continue;

    for (const variantId in cartItems[itemId]) {
      for (const size in cartItems[itemId][variantId]) {
        const quantity = cartItems[itemId][variantId][size];

        if (quantity > 0) {
          totalAmount += itemInfo.price * quantity;
        }
      }
    }
  }

  return totalAmount;
};

  // -------------------Remove Item from Cart ---------------------------//

 const removeFromCart = async (itemId, variantId, size) => {
  // Guest customer
  if (!token) {
    setCartItems((prevCart) => {
      const cartData = structuredClone(prevCart);

      if (!cartData[itemId]?.[variantId]) {
        return prevCart;
      }

      delete cartData[itemId][variantId][size];

      // Remove variant if it has no remaining sizes
      if (Object.keys(cartData[itemId][variantId]).length === 0) {
        delete cartData[itemId][variantId];
      }

      // Remove product if it has no remaining variants
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }

      return cartData;
    });

    toast.success("Product removed from cart");
    return;
  }

  // Logged-in customer
  try {
    const response = await api.delete("/api/v1/cart/remove", {
      data: {
        productId: itemId,
        variantId,
        size,
      },
    });

    if (response.data.success) {
      setCartItems((prevCart) => {
        const cartData = structuredClone(prevCart);

        if (cartData[itemId]?.[variantId]) {
          delete cartData[itemId][variantId][size];

          if (Object.keys(cartData[itemId][variantId]).length === 0) {
            delete cartData[itemId][variantId];
          }

          if (Object.keys(cartData[itemId]).length === 0) {
            delete cartData[itemId];
          }
        }

        return cartData;
      });

      toast.success("Product removed from cart");
    }
  } catch (error) {
    console.error("Remove cart error:", error);

    toast.error(
      error.response?.data?.message || "Failed to remove cart item"
    );
  }
};

  // --------------------Get Product Data from Backend ---------------------//
  useEffect(() => {
    const getProductData = async () => {
      try {
        const [
          allProductsResponse,
          latestProductsResponse,
          bestSellersResponse,
        ] = await Promise.all([
          api.get("/api/v1/product/all-product"),

          api.get("/api/v1/product/latest"),

          api.get("/api/v1/product/best-sellers"),
        ]);

        if (allProductsResponse.data.success) {
          setProducts(allProductsResponse.data.products);
        }

        if (latestProductsResponse.data.success) {
          setLatestProducts(latestProductsResponse.data.products);
        }

        if (bestSellersResponse.data.success) {
          setBestSellers(bestSellersResponse.data.products);
        }
      } catch (error) {
        console.log(error);

        toast.error(error.response?.data?.message || "Failed to load products");
      }
    };
    getProductData();
  }, []);

  // ----------------------------------Get User Profile------------------------------

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        if (!token) {
          setUser(null);
          return;
        }

        const response = await api.get("/api/v1/user/profile");

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log("Profile Error:", error);
      }
    };

    getUserProfile();
  }, [token]);

  // ---------------------------------------Log out --------------------------------

  const logout = async () => {
    try {
      const response = await api.post(
        "/api/v1/user/logout",
        {},
        { withCredentials: true },
      );

      if (response.data.success) {
        // Clear the frontend authentication state

        localStorage.removeItem("accessToken");
        setToken("");
        setUser(null);
        setCartItems({});
        toast.success("Logged out successfully");

        return false;
      }
    } catch (error) {
      console.error("Logout API error:", error.response?.data || error.message);
    }
  };

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
    logout,
  };
  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;

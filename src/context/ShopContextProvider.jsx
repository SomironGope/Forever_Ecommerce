import { ShopContext } from "./ShopContext"
 import { useEffect, useState } from "react";
 import {products} from '../assets/products';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
 

  export const ShopContextProvider = (props) => {
    const currency = '⃁'
    const delivery_fee = '10'
    const [search, setSearch] = useState ('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems,setCartItems] = useState ({});
    const navigate = useNavigate()


    const addToCart = async (itemId,size) => {
      
      if(!size) {
        toast.error('Select Product Size')
        return;
      // }else{
      //   toast.success('Added successfully')
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

      //   Updates Quantity and Modify //

      const updateQuantity = async (itemId,size,quantity) => {
        let cartData = structuredClone(cartItems);

        cartData[itemId][size] = quantity;

        setCartItems(cartData);
      }



       // Total Cart Amount //

       const getCartAmount =  () => {
        let totalAmount = 0;
        for(const items in cartItems){ 
          let itemInfo = products.find((product) => product.id === Number(items) );
          for(const item in cartItems[items]) {
            try {
               if(cartItems[items][item] > 0) {
                totalAmount += itemInfo.new_price * cartItems[items][item];
               }
            } catch (error) { 
              console.log(error)
            }
          }
        }
        return totalAmount;
       }


    const value = {
       products,
       currency,
       delivery_fee,
       search,
       setSearch,
       showSearch,
       setShowSearch,
       cartItems,addToCart,
       getCartCount,
       updateQuantity,
       getCartAmount,
       navigate
    }
    return (
      <ShopContext.Provider value={value}>
        {props.children}
      </ShopContext.Provider>
    )
    
  }




export default ShopContextProvider;

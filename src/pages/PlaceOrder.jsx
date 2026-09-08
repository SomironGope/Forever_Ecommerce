import { useContext, useState } from "react";
import { assets } from "../assets/products";
import CartTotal from "../component/CartTotal";
import Title from "../component/Title";
import { ShopContext } from "../context/ShopContext";
import axios from 'axios';
import {toast} from 'react-toastify'


function PlaceOrder() {
   const [method,setMethod] = useState('COD')
   const {navigate, cartItems, token, setCartItems} = useContext (ShopContext);
   const [loading, setLoading] = useState (false);

 
   const [address, setAddress] = useState ({
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
      phone: '',

   });


   const onChangeHandler = (e) => {
      const {name, value} = e.target;

      setAddress((prev) => ( {
          ...prev,
         [name] : value,
      }
        
      ));
   }
  
   const submitPlaceOrder = async (e) => {
      e.preventDefault()


      if(!token) {
         toast.error("Please login before placing an order");
        navigate('/login');
        return;
      }

      try {
         setLoading (true);
         // ------------------Convert cartItems object into order items array-------------------

         const orderItems = [];

         for (const productId in cartItems) {

             for (const size in cartItems[productId]) {

               const quantity = cartItems[productId][size];

               if(quantity > 0) {

                  orderItems.push( {

                     productId,
                     quantity,
                     size,
                     
                  });
               }
             }
         }


         // ----------------------Check cart-----------------------

         if (orderItems.length === 0) {
            toast.error ('Your cart is empty');
            navigate('/cart');
            return;
         }

        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const response = await axios.post (`${backendUrl}/api/v1/order`, 
         {
         items: orderItems,
         address,
         paymentMethod: method,
       }, 
       {
         headers: {
            Authorization: `Bearer ${token}`,
         },
       }
      
      );

      if(response.data.success) {
           
          const orderId = response.data.order._id;
         // ---------------COD------------------
         if (method === "COD") {
             
               await axios.delete (`${backendUrl}/api/v1/cart/clear`, {
                headers: {
               Authorization: `Bearer ${token}`,
            },
         }
      );

         // ------------------Clear frontend cart ---------------------
         setCartItems({});

         toast.success ("Order placed successfully");

         

         //--------------- Go to orders page ---------------------------
         navigate('/orders')
        }
    
      // --------------------SSLCOMMERZ-----------------------------------
       else if (method === "ONLINE") {

         // Redirect to SSLCOMMERZ checkout
         const paymentResponse = await axios.post (
            `${backendUrl}/api/v1/payment/sslcommerz/create`,
            {
               orderId,
            },

            {
               headers: {
                  Authorization: `Bearer ${token}`,
               }
            }
         );

         if(paymentResponse.data.success) {
            // Redirect customer to SSLCommerz
            window.location.href = paymentResponse.data.checkoutUrl;
         } else {
            toast.error (
               paymentResponse.data.message || "Failed to start SSLCommerz payment"
            );
         }
        }

        // -------------------RAZORPAY------------------------------------
        else if (method === "RAZORPAY") {

         // -------------------Open Razorpay checkout---------------------

        }
      

      }

      } catch (error) {
         
         console.error ("Place Order Error:", error);

         toast.error (error.response?.data?.message || "Failed to place order")
      } finally {
         setLoading (false);
      }
   }

  return (
    <form onSubmit={submitPlaceOrder} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min:h-[80vh]">
       {/* Left Side */}
       <div className="flex flex-col gap-4 w-full sm:max-w-120">
           <div className="text-xl sm:text-2xl my-3">
              <Title text1={'DELIVERY'} text2={'INFORMATION'} />

           </div>
           <div className="flex gap-3">
             <input  onChange={onChangeHandler} name="firstName" value = {address.firstName} className="border border-gray-400 rounded py-1 px-3 w-full outline-none focus:border-sky-600" type="text" placeholder="First name" required/>
              <input onChange={onChangeHandler} name= "lastName" value={address.lastName} className="border border-gray-400 rounded py-1 px-3 w-full outline-none focus:border-sky-600" type="text" placeholder="Last name" required/>
           </div>
         
            <input onChange={onChangeHandler} name="street" value = {address.street} className="border border-gray-400 rounded py-1 px-3 w-full outline-none focus:border-sky-600" type="text" placeholder="Street" required/>
           <div className="flex gap-3">
             <input onChange={onChangeHandler} name="city" value={address.city} className="border border-gray-400 rounded py-1 px-3 w-full outline-none focus:border-sky-600" type="text" placeholder="City" required/>
           </div>
           <div className="flex gap-3">
             <input onChange={onChangeHandler} name="postalCode" value = {address.postalCode} className="border border-gray-400 rounded py-1 px-3 w-full outline-none focus:border-sky-600" type="number" placeholder="PostalCode" required/>
              <input onChange={onChangeHandler} name="country" value = {address.country} className="border border-gray-400 rounded py-1 px-3 w-full outline-none focus:border-sky-600" type="text" placeholder="Country" required/>
           </div>
           <input onChange={onChangeHandler} name="phone" value={address.phone} className="border border-gray-400 rounded py-1 px-3 w-full outline-none focus:border-sky-600" type="tel" placeholder="Phone" required/>

       </div>

       {/* ------------------------------------Right Side ------------------------------- */}
        <div className="mt-8">
           <div className="mt-8 min-w-80">
             <CartTotal />

           </div>
           <div className="mt-12">
             <Title text1={'PAYMENT'} text2={'METHOD'} />

                 {/* -------------------------------PAYMENT Method Selection -------------------------*/}
             <div className="flex gap-3 flex-col lg:flex-row">

                      {/* ------------------SSLCOMMERZ ----------------  */}
               <div  onClick = {() => setMethod('ONLINE')}className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                  <p className= {`min-w-3.5 h-3.5 border rounded-full ${method === 'ONLINE' ? 'bg-green-400' : ''}`}></p>
                  <img className="h-8 w-15  mx-4 object-cover rounded-md" src= {assets.sslcommerz}  alt="sslcommerz" />
               </div>

                {/* ----------------------RAZORPAY ---------------------- */}
                {/* <div onClick = {() => setMethod('RAZORPAY')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                  <p className= {`min-w-3.5 h-3.5 border rounded-full ${method === 'RAZORPAY' ? 'bg-green-400' : ''}`}></p>
                  <img className="h-8 mx-4" src= {assets.razorpay} alt="RAZORPAY" />
               </div>  */}
                   
                   {/* ----------------------CASH ON DELIVERY------------------- */}

               <div onClick = {() => setMethod('COD')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                  <p className= {`min-w-3.5 h-3.5 border rounded-full ${method === 'COD' ? 'bg-green-400' : ''}`}></p>
                  <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
               </div>
               
             </div>

           </div>
           <div className="w-full text-end mt-8">
              <button type="submit" disabled = {loading} className="bg-black text-white px-6 py-3 text-sm cursor-pointer rounded-md">
               
               {loading ? "PLACE ORDER..." : "PLACE ORDER" } </button>

           </div>

        </div>
    </form>
  )
}

export default PlaceOrder;
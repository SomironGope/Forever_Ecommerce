import { useContext, useState } from "react";
import { assets } from "../assets/products";
import CartTotal from "../component/CartTotal";
import Title from "../component/Title";
import { ShopContext } from "../context/ShopContext";


function PlaceOrder() {
   const [method,setMethod] = useState('cod')
   const {navigate} = useContext (ShopContext);


  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min:h-[80vh]">
       {/* Left Side */}
       <div className="flex flex-col gap-4 w-full sm:max-w-120">
           <div className="text-xl sm:text-2xl my-3">
              <Title text1={'DELIVERY'} text2={'INFORMATION'} />

           </div>
           <div className="flex gap-3">
             <input className="border border-gray-400 rounded py-1 px-3.5 w-full outline-none focus:border-sky-600" type="text" placeholder="First name"/>
              <input className="border border-gray-400 rounded py-1 px-3.5 w-full outline-none focus:border-sky-600" type="text" placeholder="Last name"/>
           </div>
            <input className="border border-gray-400 rounded py-1 px-3.5 w-full outline-none focus:border-sky-600" type="email" placeholder="Email address"/>
            <input className="border border-gray-400 rounded py-1 px-3.5 w-full outline-none focus:border-sky-600" type="text" placeholder="Street"/>
           <div className="flex gap-3">
             <input className="border border-gray-400 rounded py-1 px-3.5 w-full outline-none focus:border-sky-600" type="text" placeholder="City"/>
              <input className="border border-gray-400 rounded py-1 px-3.5 w-full outline-none focus:border-sky-600" type="text" placeholder="State"/>
           </div>
           <div className="flex gap-3">
             <input className="border border-gray-400 rounded py-1 px-3.5 w-full outline-none focus:border-sky-600" type="number" placeholder="Zipcode"/>
              <input className="border border-gray-400 rounded py-1 px-3.5 w-full outline-none focus:border-sky-600" type="text" placeholder="Conutry"/>
           </div>
           <input className="border border-gray-400 rounded py-1 px-3.5 w-full outline-none focus:border-sky-600" type="number" placeholder="Phone"/>

       </div>

       {/* Right Side */}
        <div className="mt-8">
           <div className="mt-8 min-w-80">
             <CartTotal />

           </div>
           <div className="mt-12">
             <Title text1={'PAYMENT'} text2={'METHOD'} />

             {/* PAYMENT Method Selection */}
             <div className="flex gap-3 flex-col lg:flex-row">
               <div  onClick = {() => setMethod('stripe')}className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                  <p className= {`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                  <img className="h-8 mx-4" src= {assets.stripe} alt="stripe" />
               </div>
                <div onClick = {() => setMethod('razorpay')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                  <p className= {`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                  <img className="h-8 mx-4" src= {assets.razorpay} alt="stripe" />
               </div> 
               <div onClick = {() => setMethod('cod')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
                  <p className= {`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                  <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
               </div>
               
             </div>

           </div>
           <div className="w-full text-end mt-8">
              <button onClick = {() => navigate('/orders')} className="bg-black text-white px-6 py-3 text-sm cursor-pointer rounded-md">PLACE ORDER</button>

           </div>

        </div>
    </div>
  )
}

export default PlaceOrder;
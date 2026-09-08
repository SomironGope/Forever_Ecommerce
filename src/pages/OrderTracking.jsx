import { useContext, useEffect, useState } from 'react';
import {ShopContext} from '../context/ShopContext';
import {useParams} from 'react-router-dom'
import Title from '../component/Title';
import axios from 'axios';

function OrderTracking() {
  
  const {orderId} = useParams();
  const {currency, token} = useContext (ShopContext)
  const [order, setOrder] = useState (null);
  const [loading, setLoading] = useState (true)


  const backendUrl = import.meta.env.VITE_BACKEND_URL;


//  ------------------------------Get Signle Order-------------------------------



useEffect (() => {
  const fetchOrder = async () => {
    if(!token || !orderId) {
      setLoading (false);
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/api/v1/order/${orderId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      

      console.log("orderId:", orderId);
      console.log("token:", token);


      if(response.data.success) {
        setOrder (response.data.order);
      }

    } catch (error) {
      console.error ("Get Signle Order Error:",error);
      
    }finally {
      setLoading(false)
    }
  }

    fetchOrder()
}, [token,orderId,backendUrl])


// --------------------------Loading-------------------

if(loading) {
  return (
    <div className='border-t pt-16'>
         <Title text1={"ORDER"} text2={"TRACKING"} />
         <p className = 'mt-8 text-gray-500'> Loading...</p>
    </div>
  )
}

// -----------------------------ORDER NOT FOUND-----------------------

if(!order) {
  return (
    <div className='border-t pt-16'>
       <Title text1={"ORDER"} text2={"TRACKING"} />
       <p className='mt-8 text-red-500'>Order not found</p>

    </div>
  )
}


//-----------------------------ORDER STATUS------------------------------

const statuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
];



const currentStatus = statuses.indexOf(order.orderStatus);

return (
  <div className='pt-20'>
      <Title text1={"ORDER"} text2={"TRACKING"} />

      {/* -------------------ORDER INFORMATION------------------------ */}

      <div className='mt-8 border rounded-md p-5'> 
         <div className='flex flex-col sm:flex-row sm:justify-between gap-3'>
            <div>
               <p className='text-sm text-gray-500'>Order ID</p>

               <p className='font-medium break-all'>{order._id}</p>
            </div>

            <div>
                <p className='text-sm text-gray-500'>Order Date</p>
                
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            <div>
               <p className='text-sm text-gray-500'>Total</p>

               <p className='font-medium'>{order.amount} {currency}</p>
            </div>
         </div>
      </div>

      {/* --------------------------------CANCELLED ORDER------------------------ */}

      {order.orderStatus === "Cancelled" ? (
         <div className='mt-8 border border-red-200 bg-red-100 rounded-md p-6'>
            <p className='text-lg font-medium text-red-600'>Order Cancelled</p>

            <p className='mt-2 text-sm text-gray-600'>This order has been cancelled.</p>
          </div>
      ): (
      // -------------------TRACKING----------------------------------------------------

       <div className='mt-20'>
         
           <p className='text-lg font-medium mb-8'>
              Order Status
           </p>

            <div className='relative'>
                
                {/* -----------------------Progress Line------------------------------ */}

                 <div className='absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200'>
                     <div className="bg-black w-full transition-all duration-500" style={{ height: currentStatus >= 0 ? `${(currentStatus / (statuses.length - 1)) * 100}%` : "0%", }} />
                  
                  </div>



                  {/* ---------------Status Items-------------------------- */}

                    <div>
                        {statuses.map((status,index) => {
                          const completed = index <= currentStatus;

                         return (
                          <div key={status} className='relative flex items-center gap-5'>

                             {/* -------------------------Circle---------------------------- */}

                               <div className= {`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                completed ? "bg-green-500 text-white border-black font-bold" : "bg-white text-gray-400 border-gray-300"
                               }`} > 
                               {completed ? "✓" : index + 1}

                               </div>

                               {/* -----------------------Status Text------------------------ */}

                               <div>
                                  <p className= {`font-medium ${completed ? "text-black" : "text-gray-400"}`}>{status}</p>
                                
                                   <p className='text-sm text-gray-500'> {status === "Pending" && "Your order has been placed."}

                                     {status === "Processing" && "Your order is being prepared."}

                                     {status === "Shipped" && "Your order is on the way."} 

                                     {status === "Delivered" && "Your order has been deliver"}
                                   </p>
                                
                                </div>

                          </div>
                           );

                        })}
                    </div>
                  
                  </div>
            </div>
        )}

        {/* // --------------------------PAYMENT INFORMATION---------------------------------------------- */}

        <div className='mt-10 border-t pt-6'>
           <p className='font-medium mb-3'>
             Payment Information
           </p>

            <p className='text-sm text-gray-600'>
             Payment Method: {" "} <span className='font-medium'>{order.paymentMethod}</span>
           </p>

            <p className='text-sm text-gray-600 mt-1'>
             Payment Status: {" "} <span className='font-medium'> {order.paymentStatus}</span>
           </p>
        </div>
   
   </div>
)}
      
 












export default OrderTracking;
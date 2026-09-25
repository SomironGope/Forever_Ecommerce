import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import {useNavigate} from 'react-router-dom'
import Title from "../component/Title";
import axios from "axios";




function Orders() {
  const { currency, token} = useContext(ShopContext);

  const [orders, setOrders] = useState ([]);

  const [loading, setLoading] = useState (true);

  const navigate = useNavigate()

  const backendUrl = import.meta.env.VITE_BACKEND_URL;








  



  useEffect (() => {
    
    const fetchOrders = async () => {

    try {
      
      const response = await axios.get (`${backendUrl}/api/v1/order/my-orders`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if(response.data.success) {

        setOrders(response.data.orders);
      }

    } catch (error) {

      console.error ("Get Orders Error:", error);

    } finally {

      setLoading(false)
    }
  };

  fetchOrders ();
  }, [token, backendUrl]);



  if(loading) {

     return (
      <div className = 'pt-16'>

          <div className="text-2xl">

              <Title text1={"MY"} text2={"ORDERS"} />
          </div>
         <p className="mt-8 text-gray-500">Loading orders...</p>
      </div>
     );
  }
 

  return (
    <div className="pt-16">
      <div>
          <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {
        orders.length === 0 ? (

          <p className="mt-8 text-gray-500" >You haven't placed any orders yet.</p>
        ): (
          <div className="mt-6">

             {orders.map((order) => (

              <div key={order._id} className="py-6 border-t border-b text-gray-700">

                  {/* ----------------ORDERS ITEMS--------------------- */}
                  {
                    order.items.map((item,index) => (

                      <div key = {`${order._id}-${index}`} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5" >
                          
                          <div className="flex items-start gap-6 text-sm">

                              <img className = 'w-16 sm:w-20 rounded-sm ' src = {item.image} alt= {item.name} />

                              <div>
                                  <p className="sm:text-base font-medium">{item.name}</p>

                                  <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                                    
                                    <p> {item.price} {currency}</p>

                                    <p>Quantity: {item.quantity}</p>

                                    <p>Size: {item.size} </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                  }

                  
             {/* -----------------------------ORDER INFORMANTION---------------------------- */}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t pt-5">
                 {/* ----------------------Delivery Address----------------------- */}
                 <div>
                    <p className="font-medium text-gray-800 mb-2">Delivery Address</p>

                    <p>{order.address?.firstName} {" "} {order.address?.lastName}</p>

                    <p>{order.address?.street}</p>

                    <p>{order.address?.city} {" "} {order.address?.postalCode}</p>

                    <p>{order.address?.country}</p>

                    <p className="mt-1">phone: {order.address?.phone}</p>

                  </div>


                  {/* ----------------ORDER DETAILS------------------------------- */}

                  <div> 
                    
                     {
                      order.paidAt && (
                         <p>Paid At: {" "} <span className="font-medium text-black">{new Date(order.createdAt).toLocaleString()}</span></p>
                         )
                     }
                     
                      <p className="mt-1">Payment Method: {" "} <span className="text-gray-400">{order.paymentMethod}</span></p>
                      
                      <p className="mt-1">Total: {" "}<span className="font-medium"> {order.amount} {currency}</span></p>

                      <p className="mt-1">Status: {" "}<span className="text-gray-600">{order.orderStatus}</span></p>

                      <p className="mt-1">Payment Status: <span className="text-gray-600">{" "} {order.paymentStatus} </span></p>

                       {
                          order.refundedAt && (

                           <p>Refunded At: {" "} <span className="font-medium text-black">{new Date(order.refundedAt).toLocaleString()}</span></p>
                          
                          )
                      }
                   
                    </div>
              </div>
               

               {/* -------------------------------TRACK ORDER-------------------------- */}

                <div className="flex justify-end mt-5">

                  <button onClick={() => navigate (`/order/${order._id}`)} className="border px-4 py-2 text-sm rounded-sm cursor-pointer hover:bg-black hover:text-white transition">Track Order</button>
                </div>

              </div>
             ))}

          </div>
        ) 
      }

    </div>
  )
}

export default Orders;
 
 

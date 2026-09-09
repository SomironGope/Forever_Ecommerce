import { useEffect, useState } from "react"
import axios from "axios";
import { toast } from "react-toastify";

function Orders() {

  const [orders, setOrders] = useState ([]);
  const [loading, setLoading] = useState (false);

  const url = import.meta.env.VITE_BACKEND_URL;

  const token = localStorage.getItem("adminToken");


// ----------------------Fetch All Orders---------------------

useEffect (() => {

  const fetchOrders = async () => {
  try {
    setLoading (true);

    const response = await axios.get(`${url}/api/v1/order/all-orders`,
      {

      headers: {
        Authorization:  `Bearer ${token}`,
      },
    }
  );

  if(response.data.success) {
    setOrders (response.data.orders);
  }

  } catch (error) {
    console.error ( "Fetch Orders Error:", error);

    toast.error (error.response?.data?.message || "Failed to fetch orders");
  }finally {
    setLoading(false)
  }
}
 fetchOrders()
}, [url, token])



// -------------------------Update Order Status ----------------------

const updateOrderStatus = async (orderId, orderStatus) => {
  try {
    
    const response = await axios.put (`${url}/api/v1/order/update-status/${orderId}`, 
      {
         orderStatus
      },

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if(response.data.success) {
      toast.success ("Order status updated");

      setOrders((prevOrders) => 
        prevOrders.map((order) =>
           order._id === orderId
       ? {
        ...order,
        orderStatus: response.data.order.orderStatus,
      }
       :order
      ) 
    );

  }

  } catch (error) {
    console.error ("Update Order Status Error:", error);

    toast.error(error.response?.data?.message || "Failed to update order status")
    
  }
}



const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    
    const response = await axios.put (`${url}/api/v1/order/${orderId}/payment-status`,
       {
          paymentStatus,
       },

       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
      );

       if(response.data.success) {
         toast.success ("Payment status updated");

         setOrders ((prevOrders) =>
           prevOrders.map((order) => 
            order._id === orderId 
         ?  {
            ...order,
            paymentStatus: response.data.order.paymentStatus,
            paidAt: response.data.order.paidAt,
            }
             
            :order

          )
         );
       }

  } catch ( error) {
    console.error("Update Payment Status Error:", error);

    toast.error (error.response?.data?.message || "Failed to update payment status")
  }
}

if(loading) {
  return (
    <div className="pt-5"><p>Loading orders...</p></div>
  );
}
  return (
    <div>
        <h2 className="text-2xl font-medium"> Orders</h2>

        <div className="flex flex-col gap-5">
           
           {orders.map((order) => (
            <div key={order._id} className= "border rounded-lg bg-white p-5" >

              {/* ----------------------Order Header------------------------- */}

              <div className= "flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
               <div>
                  <p className="font-medium">Order Id</p>

                  <p className="text-sm text-gray-500">{order._id}</p>
                </div>

                <div className="font-medium">
                   <p className="font-medium">Amount</p>
                   <p>{order.amount}</p>
                </div>

            </div>
                {/* ------------------------Product--------------------------- */}
                <div className="border-t border-b py-4">
                    {order.items.map((item,index) => (
                       <div key={index} className="flex gap-4 mb-4 last:mb-0">
                        <img src= {item.image} alt= {item.name} className="w-16 h-16 object-cover rounded"/>

                        <div >
                           <p className="font-medium">{item.name}</p>

                           <p className="text-sm text-gray-500">Size: {item.size}</p>

                           <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>

                           <p className="text-sm"> Price: {item.price} </p>

                        </div>

                       </div>
                    ))}
                  </div>

                  {/* -------------------Status Controls ------------------------- */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

                    {/* -----------------Order Status----------------------------- */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Order Status</label>

                        <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order._id, e.target.value)} className="border rounded px-3 py-2 w-full outline-none" >
                           
                            <option value= "Pending">Pending</option>
                            <option value= "Processing">Processing</option>
                            <option value= "Shipped">Shipped</option>
                            <option value= "Delivered">Delivered</option>
                            <option value= "Cancelled">Cancelled</option>

                        </select>

                      </div>
                       {/* -----------------------Payment Status-------------------------- */}

                       <div> 
                           
                           <label className="block text-sm font-medium mb-2" >Payment Status</label>

                           <select value={order.paymentStatus} onChange={(e) =>
                             updatePaymentStatus (order._id, e.target.value)} className="w-full border rounded px-3 py-2 outline-none">

                             <option value= "Pending">Pending</option>
                             <option value= "Paid">Paid</option>
                             <option value= "Failed">Failed</option>
                             <option value= "Refunded">Refunded</option>
                             

                           </select>

                       </div>
                  </div>
                       
                     {/* --------------------------Payment Information------------------------------- */}
                      <div className="mt-5 text-sm text-gray-600">

                        <p>Payment Method: {" "} <span className="font-medium text-black">{order.paymentMethod}</span></p>
                        
                        {order.paymentProvider && (
                          <p>
                             Payment Provider: {" "} <span className="font-medium text-black">{order.paymentProvider}</span>
                          </p>
                        )}


                         
                        {order.transactionId && (
                          <p>
                             Transaction ID: {" "} <span className="font-medium text-black">{order.transactionId}</span>
                          </p>
                        )}

                        {
                          order.paidAt && (
                            <p>Paid At: {" "} <span className="font-medium text-black">{new Date(order.paidAt).toLocaleString() }</span></p>
                          )
                        }
                      </div>
            </div>

       
           ))}
           
        </div>
    </div>
  )
}

export default Orders
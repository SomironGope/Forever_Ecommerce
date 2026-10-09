import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";


function OrderDetailsPage() {
  const {adminToken, backendUrl,currency} = useContext (AdminContext);

  const {orderId} = useParams();
  const [order, setOrder] = useState (null);
  const [loading, setLoading] = useState (true);



  //--------------------------Get Order Details----------------------

  useEffect (() => {
   const fetchOrderDetails = async () => {

    try {
      setLoading (true);

      const response = await axios.get (`${backendUrl}/api/v1/order/admin/${orderId}`, 
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          },
        }
      );
        console.log(response.data);
      if (response.data.success) {
        setOrder (response.data.order);

      } else {
        toast.error (response.data.message);
      }


    } catch (error) {
      console.log("Order Details Error:", error);

      toast.error (error.response?.data?.message || "Failed to load order details.")
    }finally {
      setLoading (false);
    }


  }

    fetchOrderDetails ()
  }, [orderId,backendUrl,adminToken])

  

  // =======================Loading =============================


  if (loading) {
      return (
    <div className="min-h-screen flex items-center justify-center">
       <p className="text-gray-500 text-lg">
         Loading order details...
       </p>
      
      </div>
  )
  }
 


  // ======================No Order=====================

  if (!order) {
    return (
       <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <h2 className="text-2xl font-semibold text-gray-800"> Order not found</h2>

          <Link to = "/orders" className="px-5 py-2 bg-black text-center text-white rounded-md hover:bg-gray-800">Back to Orders</Link>
       </div>
    )
  }

  // ===========================Status Color=======================

  const getStatusStyle = (status) => {

    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

        case "Processing":
          return "bg-blue-100 text-blue-700";

       case "Shipped":
        return "bg-purple-100 text-purple-700";
        
        case "Delivered":
          return "bg-green-100 text-green-700";

        case "Cancelled": 
          return "bg-red-100 text-red-700";

          default:
            return "bg-gray-100 text-gray-700"
    }
  }


  //===========================Payment Style=============================

  const getPaymentStyle = (status) => {

    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";


      case "Pending":
         return "bg-yellow-100 text-yellow-700";

      case "Failed":
         return "bg-red-100 text-red-700";
      
      case "Refunded":
         return "bg-purple-100 text-purple-700";

      default: 
        return "bg-gray-100 text-gray-700"
    }
  };


  return (
     <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-10 ">
        <div className="max-w-6xl mx-auto">
            {/* =======================Header=========================== */}
             <div className="flex flex-col mb-5 sm:flex-row-reverse sm:items-center sm:justify-between ">
                 <Link to = "/orders" className = " w-fit text-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 transition">
                 
                 ← Back to Orders
                 </Link>
          
                
                 <div className = "mt-8 sm:mt-0">
                     <h1 className="text-2xl sm:text-3xl font-semibold text-gray-500">Order Details</h1>
                     
                     <p className = "text-sm text-gray-500 mt-1">Order ID: {order._id}</p>
                 </div>

                 
             </div>

             {/* =======================Order  Status ======================*/}

             <div className = "bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
               
                <div className = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                     
                      <div>
                           <p className = "text-sm text-gray-500">Order Status:</p>

                           <span className = {`inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-medium ${getStatusStyle(order.orderStatus)}`}>
                             
                             {order.orderStatus}
                            </span> 
                      </div>
                          {/* ----------Payment Status------------ */}
                      <div>
                          <p className = "text-sm text-gray-500">Payment Status</p>

                          <span className = {`inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-medium ${getPaymentStyle(order.paymentStatus)}`}>
                             {order.paymentStatus}
                          </span>
                      </div>

                      {/* -----------Payment Method----------------- */}

                      <div>
                          <p className = "text-sm text-gray-500">Payment Method</p>
                          <p className = "font-medium text-gray-500 mt-2">{order.paymentMethod}</p>
                      </div>                    
                </div>
                
             </div>

             {/* ================Customer Information========================== */}

             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                 <h2 className="text-lg font-semibold text-gray-800 mb-5">Customer & Shipping Information</h2>

                 <div>
                     {/* ----Customer---- */}

                     <p className="text-sm text-gray-500 mb-1">Customer</p>

                     <p className="font-medium text-gray-800">{order.userId?.firstName} {order.userId?.lastName}</p>
                     
                     <p className="text-sm text-gray-500 mb-1">{order.userId?.email}</p>

                     <p className="text-sm text-gray-500"> {order.userId?.phone}</p>
                
                 </div>

                 {/* ------Shipping Address------ */}

                 <div>
                      <p className="text-sm text-gray-500 mb-1">Shipping Address</p>

                      <p className="font-medium text-gray-800">{order.address?.firstName} {order.address?.lastName}</p>

                      <p className="text-sm text-gray-500">{order.address?.street}</p>

                      <p className="text-sm text-gray-500">{order.address?.city}, {order.address?.postalCode}</p>
                
                     <p className="text-sm text-gray-500">{order.address?.country}</p>
                 </div>
             </div>

             {/* =========================Order Items ====================== */}

             <div className = "bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                 <h2 className = "text-lg font-semibold text-gray-800 mb-5">Order Items</h2>
            
              <div className = "space-y-5">
                   {order.items?.map ((item, index) => (
                    <div key= {item._id || index} className = "flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-5 last:border-none last:pb-0">
                   
                      {/* ---------------Product Image-------------- */}

                          <div className = "w-24 h-24 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                          
                             <img src = {item.productImg?.[0].url || item.image || "/placeholder.png"} alt = {item.name || "Product Image"}
                             className = 'w-full h-full object-cover'/>
                             
                          </div>

                          {/* ------------------Product Info----------------- */}
                           <div className = "flex-1">

                               <h3 className = "text-gray-500 font-medium">{item.name}</h3>

                               {item.size && (
                                 <p className = "text-sm text-gray-500 mt-1">Size: {item.size}</p>
                                 )}


                                 <p className = "text-sm text-gray-500 mt-1"> Quantity: {item.quantity}</p>

                                 <p className = "text-sm text-gray-500 mt-1">Price: {currency} {item.price}</p>
                            </div>
                      </div>
                   ))}
              </div>
            
             </div>
        </div>
     </div>
  )

}

export default OrderDetailsPage;
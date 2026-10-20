import { useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import adminAxios from "../utils/AdminAxios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchOrder, setSearchOrder] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("");
  const [sortType, setSortType] = useState("latest");

  const navigate = useNavigate();

  const url = import.meta.env.VITE_BACKEND_URL;

  const token = localStorage.getItem("adminAccessToken");

  // ----------------------Fetch All Orders---------------------

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const response = await adminAxios.get("/api/v1/order/all-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error("Fetch Orders Error:", error);

        toast.error(error.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [url, token]);

  // -------------------------Update Order Status ----------------------

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      const response = await adminAxios.put(
        `/api/v1/order/update-status/${orderId}`,
        {
          orderStatus,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success("Order status updated");

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: response.data.order.orderStatus,
                }
              : order,
          ),
        );
      }
    } catch (error) {
      console.error("Update Order Status Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update order status",
      );
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const response = await adminAxios.put(
        `/api/v1/order/${orderId}/payment-status`,
        {
          paymentStatus,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success("Payment status updated");

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  paymentStatus: response.data.order.paymentStatus,
                  paidAt: response.data.order.paidAt,
                }
              : order,
          ),
        );
      }
    } catch (error) {
      console.error("Update Payment Status Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update payment status",
      );
    }
  };

  const refundOrder = async (orderId) => {
    const confirmRefund = window.confirm(
      "Are you sure you want to refund this payment?",
    );

    if (!confirmRefund) return;

    try {
      const response = await adminAxios.post(
        `/api/v1/payment/refund/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success("Refund completed successfully");

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  paymentStatus: "Refunded",
                  orderStatus: "Cancelled",
                }
              : order,
          ),
        );
      }
    } catch (error) {
      console.error("Refund Error:", error);

      toast.error(
        error.response?.data?.message ||
          `Refund failed: ${error.response?.data?.paymentStatus || "Unknown error"}`,
      );
    }
  };

  const filterOrders = useMemo(() => {
    let orderCopy = [...orders];

    if (searchOrder) {
      orderCopy = orderCopy.filter((order) =>
        order._id.toLowerCase().includes(searchOrder.toLowerCase()),
      );
    }

    if (orderStatus) {
      orderCopy = orderCopy.filter(
        (order) => order.orderStatus === orderStatus,
      );
    }

    if (paymentStatus) {
      orderCopy = orderCopy.filter(
        (order) => order.paymentStatus === paymentStatus,
      );
    }

    orderCopy.sort((a, b) => {
      if (sortType === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortType === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });

    return orderCopy;
  }, [orders, searchOrder, orderStatus, paymentStatus, sortType]);

  if (loading) {
    return (
      <div className="pt-5">
        <p>Loading orders...</p>
      </div>
    );
  }
  return (
    <div className="pt-5">
      <h2 className="text-2xl font-medium"> Orders</h2>

      <div className="w-full md:max-w-100  z-50 flex gap2 items-center mb-5 pt-3 ">
        <div className=" flex-1 relative ">
          <input
            type="text"
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            placeholder="Search Order ID"
            className="w-full md:max-w-100 border focus:border-sky-500 outline-none rounded-sm px-2 py-1 text-gray-600 text-sm placeholder:text-sm"
          />

          <div className="absolute top-1 right-2">
            <IoSearch className=" w-5 h-5  rounded-sm gap-2 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="flex-col  space-x-2 mb-4">
        <select
          onChange={(e) => setOrderStatus(e.target.value)}
          className="w-full md:max-w-50 border border-sky-500 outline-none rounded px-2 py-1 mb-2"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full md:max-w-50 border border-sky-500 outline-none rounded px-2 py-1 mb-2"
        >
          <option value="">All Payment</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>

        <select
          onChange={(e) => setSortType(e.target.value)}
          className="w-full md:max-w-50 border border-sky-500 outline-none rounded px-2 py-1 mb-2"
        >
          <option value="latest">Latest Orders</option>
          <option value="oldest">Oldest Orders</option>
        </select>
      </div>

      <div className="flex flex-col gap-5">
        {filterOrders.map((order) => (
          <div key={order._id} className="border rounded-lg bg-white p-5">
            {/* ----------------------Order Header------------------------- */}

            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
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
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 mb-4 last:mb-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />

                  <div>
                    <p className="font-medium">{item.name}</p>

                    <p className="text-sm text-gray-500">Size: {item.size}</p>

                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    <p className="text-sm"> Price: {item.price} </p>
                  </div>
                </div>
              ))}
            </div>

            {/* -------------------Status Controls ------------------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {/* -----------------Order Status----------------------------- */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Order Status
                </label>

                <select
                  value={order.orderStatus}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="border rounded px-3 py-2 w-full outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              {/* -----------------------Payment Status-------------------------- */}

              <div>
                {/* <label className="block text-sm font-medium mb-2" >Payment Status</label> */}

                <p>
                  Payment Status:{" "}
                  <span
                    className={`font-medium
                             ${
                               order.paymentStatus === "Refunded"
                                 ? "text-red-600"
                                 : order.paymentStatus === "Paid"
                                   ? "text-green-600"
                                   : "text-yellow-600"
                             }`}
                  >
                    {order.paymentStatus}
                  </span>
                </p>

                <select
                  value={order.paymentStatus}
                  onChange={(e) =>
                    updatePaymentStatus(order._id, e.target.value)
                  }
                  className="w-full border rounded px-3 py-2 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* --------------------------Payment Information------------------------------- */}
            <div className="mt-5 text-sm text-gray-600">
              <p>
                Payment Method:{" "}
                <span className="font-medium text-black">
                  {order.paymentMethod}
                </span>
              </p>

              {order.paymentProvider && (
                <p>
                  Payment Provider:{" "}
                  <span className="font-medium text-black">
                    {order.paymentProvider}
                  </span>
                </p>
              )}

              {order.transactionId && (
                <p>
                  Transaction ID:{" "}
                  <span className="font-medium text-black">
                    {order.transactionId}
                  </span>
                </p>
              )}

              {order.paidAt && (
                <p>
                  Paid At:{" "}
                  <span className="font-medium text-black">
                    {new Date(order.paidAt).toLocaleString()}
                  </span>
                </p>
              )}

              {order.refundAmount > 0 && (
                <p>
                  Refund Amount:{" "}
                  <span className="font-medium">{order.refundAmount} SAR </span>
                </p>
              )}

              {order.refundedAt && (
                <p>
                  Refunded At:{" "}
                  <span className="font-medium text-black">
                    {new Date(order.refundedAt).toLocaleString()}
                  </span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 ">
              {order.paymentMethod === "ONLINE" &&
                order.paymentProvider === "MOYASAR" &&
                order.paymentStatus === "Paid" && (
                  <div className=" flex gap-4 mt-5">
                    <button
                      disabled={loading}
                      onClick={() => refundOrder(order._id)}
                      className="bg-red-600 text-white px-4 md:px-5 py-2 rounded hover:bg-red-700 cursor-pointer hover:opacity-70 transition"
                    >
                      Refund Payment
                    </button>
                  </div>
                )}
              <button
                onClick={() => navigate(`/order-details/${order._id}`)}
                className=" bg-sky-500 mt-5 text-white px-3 md:px-5 py-2 rounded hover:opacity-70 cursor-pointer transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;

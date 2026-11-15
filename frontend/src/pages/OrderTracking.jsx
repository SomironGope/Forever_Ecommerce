
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useParams } from "react-router-dom";
import Title from "../components/Title";
import api from "../utils/axiosInstance";

function OrderTracking() {
  const { orderId } = useParams();
  const { currency, token } = useContext(ShopContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Get Single Order
  useEffect(() => {
    const fetchOrder = async () => {
      if (!token || !orderId) {
        setOrder(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setOrder(null);
      setErrorMessage("");

      try {
        const response = await api.get(`/api/v1/order/${orderId}`);

        if (response.data.success) {
          setOrder(response.data.order);
        }
      } catch (error) {
        const status = error.response?.status;

        if (status === 401) {
          setErrorMessage("Your session has expired. Please log in again.");
        } else if (status === 403) {
          setErrorMessage("You are not allowed to view this order.");
        } else if (status === 404) {
          setErrorMessage("Order not found.");
        } else {
          setErrorMessage("Unable to load your order. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token, orderId]);

  // Loading
  if (loading) {
    return (
      <div className="border-t pt-16">
        <Title text1={"ORDER"} text2={"TRACKING"} />
        <p className="mt-8 text-gray-500">Loading...</p>
      </div>
    );
  }

  // Order Not Found
  if (!order) {
    return (
      <div className="border-t pt-16">
        <Title text1={"ORDER"} text2={"TRACKING"} />
        <p className="mt-8 text-red-500">
          {errorMessage || "Please log in to track your order."}
        </p>
      </div>
    );
  }

  // Order Status
  const statuses = ["Pending", "Processing", "Shipped", "Delivered"];
  const currentStatus = statuses.indexOf(order.orderStatus);
  const isValidStatus = currentStatus !== -1;

  return (
    <div className="pt-20">
      <Title text1={"ORDER"} text2={"TRACKING"} />

      {/* ORDER INFORMATION */}
      <div className="mt-8 border rounded-md p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium break-all">{order._id}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "Date unavailable"}
            </p>

            {order.paidAt && (
              <p className="mt-1">
                Paid At:{" "}
                <span className="font-medium text-black">
                  {new Date(order.paidAt).toLocaleString()}
                </span>
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="font-medium">
              {currency} {order.amount}
            </p>
          </div>
        </div>
      </div>

      {/* ORDER ITEMS */}
      <div className="mt-10">
        <p className="text-lg font-medium mb-5">Ordered Products</p>

        <div className="border rounded-md p-5">
          {order.items?.map((item, index) => (
            <div
              key={`${item.productId || "product"}-${item.variantId || index}-${item.size}-${index}`}
              className={`flex flex-col sm:flex-row gap-4 py-5 ${
                index !== 0 ? "border-t" : ""
              }`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-28 object-cover rounded-sm"
              />

              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {item.name}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Price: {currency} {item.price}
                </p>

                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  <p>Size: {item.size}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>

                {/* SELECTED COLOR */}
                {item.colorName && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-gray-600">
                      Color:
                    </span>

                    {item.colorHex && (
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{
                          backgroundColor: item.colorHex,
                        }}
                        aria-label={item.colorName}
                      />
                    )}

                    <span className="text-sm text-gray-700">
                      {item.colorName}
                    </span>
                  </div>
                )}

                <p className="mt-3 text-sm font-medium text-gray-800">
                  Subtotal: {currency}{" "}
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DELIVERY ADDRESS */}
      <div className="mt-8 border rounded-md p-5">
        <p className="font-medium text-gray-800 mb-3">
          Delivery Address
        </p>

        <p>
          {order.address?.firstName} {order.address?.lastName}
        </p>
        <p>{order.address?.street}</p>
        <p>
          {order.address?.city} {order.address?.postalCode}
        </p>
        <p>{order.address?.country}</p>
        <p className="mt-1">Phone: {order.address?.phone}</p>
      </div>

      {/* CANCELLED ORDER */}
      {order.orderStatus === "Cancelled" ? (
        <div className="mt-8 border border-red-200 bg-red-100 rounded-md p-6">
          <p className="text-lg font-medium text-red-600">
            Order Cancelled
          </p>
          <p className="mt-2 text-sm text-gray-600">
            This order has been cancelled.
          </p>
        </div>
      ) : !isValidStatus ? (
        <div className="mt-8 rounded-md border p-6">
          <p className="font-medium">Order status unavailable</p>
          <p className="mt-2 text-sm text-gray-600">
            Please contact support for assistance.
          </p>
        </div>
      ) : (
        /* ORDER TRACKING */
        <div className="mt-20">
          <p className="text-lg font-medium mb-8">Order Status</p>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200">
              <div
                className="bg-black w-full transition-all duration-500"
                style={{
                  height: `${(currentStatus / (statuses.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Status Items */}
            <div className="space-y-8">
              {statuses.map((status, index) => {
                const completed = index <= currentStatus;

                return (
                  <div
                    key={status}
                    className="relative flex items-center gap-5"
                  >
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        completed
                          ? "bg-green-500 text-white border-black font-bold"
                          : "bg-white text-gray-400 border-gray-300"
                      }`}
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    <div>
                      <p
                        className={`font-medium ${
                          completed ? "text-black" : "text-gray-400"
                        }`}
                      >
                        {status}
                      </p>

                      <p className="text-sm text-gray-500">
                        {status === "Pending" &&
                          "Your order has been placed."}
                        {status === "Processing" &&
                          "Your order is being prepared."}
                        {status === "Shipped" &&
                          "Your order is on the way."}
                        {status === "Delivered" &&
                          "Your order has been delivered successfully."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT INFORMATION */}
      <div className="mt-10 border-t pt-6 mb-10">
        <p className="font-medium mb-3">Payment Information</p>

        <p className="text-sm text-gray-600">
          Payment Method:{" "}
          <span className="font-medium">{order.paymentMethod}</span>
        </p>

        <p className="text-sm text-gray-600 mt-1">
          Payment Status:{" "}
          <span className="font-medium">{order.paymentStatus}</span>
        </p>

        {order.refundedAt && (
          <p className="mt-1 text-sm">
            Refunded At:{" "}
            <span className="font-medium text-black">
              {new Date(order.refundedAt).toLocaleString()}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;

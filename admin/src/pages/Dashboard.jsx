import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";

import { AdminContext } from "../context/AdminContext";
import adminAxios from "../utils/AdminAxios";

import {
  Bar,
  BarChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Dashboard() {
  const { currency } = useContext(AdminContext);

  const [stats, setStats] = useState({
    totalUser: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  const [monthlyOrders, setMonthlyOrders] = useState([]);

  const [topSellingProducts, setTopSellingProducts] = useState([]);

  const [recentOrders, setRecentOrders] = useState([]);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [paymentAnalytics, setPaymentAnalytics] = useState({
    paymentStatus: [],
    paymentMethod: [],
    paymentProvider: [],

    summary: {
      paid: { amount: 0, count: 0 },
      pending: { amount: 0, count: 0 },
      failed: { amount: 0, count: 0 },
      refunded: { amount: 0, count: 0 },
    },
  });

  // =====================PaymentMethodData ===========

  const paymentMethodData = paymentAnalytics.paymentMethod.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  // ===============Payment Method Percentage ===========

  const totalPaymentMethods = paymentMethodData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const renderPaymentLabel = ({ name, value }) => {
    const percentage =
      totalPaymentMethods > 0
        ? ((value / totalPaymentMethods) * 100).toFixed(1)
        : 0;

    return `${name} ${percentage}%`;
  };

  // ====================PaymentStatus========================

  const paymentStatusData = paymentAnalytics.paymentStatus.map((item) => ({
    name: item._id,
    orders: item.count,
  }));

  //=======================Success Rate ===================

  const totalPayments =
    paymentAnalytics.summary.paid.count + paymentAnalytics.summary.failed.count;

  const paymentSuccessRate =
    totalPayments > 0
      ? ((paymentAnalytics.summary.paid.count / totalPayments) * 100).toFixed(1)
      : 0;

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await adminAxios.get("/api/v1/admin/dashboard/stats");

        const data = response.data;

        if (
          !data.success ||
          !data.stats ||
          !Array.isArray(data.monthlyRevenue) ||
          !Array.isArray(data.monthlyOrders) ||
          !Array.isArray(data.topSellingProducts) ||
          !Array.isArray(data.recentOrders)
        ) {
          throw new Error(data.message || "Invalid dashboard data received");
        }

        setStats(data.stats);
        setMonthlyRevenue(data.monthlyRevenue);
        setMonthlyOrders(data.monthlyOrders);
        setTopSellingProducts(data.topSellingProducts);
        setRecentOrders(data.recentOrders);

        // Payment Analytics (independent error handling)
        try {
          const paymentResponse = await adminAxios.get(
            "/api/v1/order/payment-analytics",
          );

          if (paymentResponse.data.success) {
            setPaymentAnalytics(paymentResponse.data);
          }
        } catch (paymentError) {
          console.error("Payment Analytics Error:", paymentError);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Convert month number to month name//

  const getMonthName = (month) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return months[month - 1];
  };

  // -----------------Prepare revenue chart data----------------

  const revenueChartData = monthlyRevenue.map((item) => ({
    name: `${getMonthName(item.month)} ${item.year}`,
    revenue: item.revenue,
  }));

  // ------------------------Prepare orders chart data-----------------------------

  const ordersChartData = monthlyOrders.map((item) => ({
    name: `${getMonthName(item.month)} ${item.year}`,
    orders: item.orders,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-150 lg:min-h-190">
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-lg">
        <p className="font-medium"> Dashboard Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ----------------------Dashboard Title--------------------------- */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-800">Dashboard</h1>

        <p className="text-gray-500 mt-1">Overview of your store</p>
      </div>

      {/* -----------------Statistics Cards------------------------------ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* ----------Total User--------------- */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Total Users</p>

          <h2 className="text-3xl font-medium text-gray-800 mt-2">
            {stats.totalUser}
          </h2>
        </div>

        {/* ----------Total Products--------------- */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Total Products</p>

          <h2 className="text-3xl font-medium text-gray-800 mt-2">
            {stats.totalProducts}
          </h2>
        </div>

        {/* ----------Total Revenue--------------- */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Total Revenue</p>

          <h2 className="text-3xl font-medium text-gray-800 mt-2">
            {" "}
            {currency} {Number(stats.totalRevenue || 0).toLocaleString()}{" "}
          </h2>
        </div>

        {/* -------------------Total Orders------------------- */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Total Orders</p>

          <h2 className="text-3xl font-medium text-gray-800 mt-2">
            {stats.totalOrders}
          </h2>
        </div>

        {/* ----------Pending Orders--------------- */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Pending Orders</p>

          <h2 className="text-3xl font-medium text-gray-800 mt-2">
            {stats.pendingOrders}
          </h2>
        </div>

        {/* ----------Delivered Orders--------------- */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Delivered Orders</p>

          <h2 className="text-3xl font-medium text-gray-800 mt-2">
            {stats.deliveredOrders}
          </h2>
        </div>
      </div>

      {/* -------------------------Charts--------------------------------- */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ------------------Revenue Chart */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-medium text-gray-800">
              Monthly Revenue
            </h2>

            <p className="text-sm text-gray-500">Revenue from paid orders</p>
          </div>

          <div className="w-full h-75 lg:h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis tickFormatter={(value) => `${currency} ${value}`} />

                <Tooltip
                  formatter={(value) => [`${currency} ${value}`, "Revenue"]}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.15}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ------------------------Orders Chart-------------------- */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-3xl font-bold text-gray-800">
              {stats.totalOrders}
            </h3>

            <p className="text-sm text-gray-500">Total Orders Received</p>
          </div>
          <div className="mb-5">
            <h2 className="text-lg font-medium text-gray-800">
              Monthly Orders
            </h2>

            <p className="text-sm text-gray-500">Number of orders received</p>
          </div>

          <div className="w-full h-75 lg:h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersChartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip formatter={(value) => [`${value}`, "Orders"]} />

                <Bar
                  dataKey="orders"
                  name="Orders"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />

                <LabelList dataKey="orders" position="top" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* // ----------------Payment Analytics Card-------------------- */}

      <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-5">
        Payment Analytics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
        {/* -----Paid-------- */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm">Paid</p>

          <h2 className="text-2xl font-bold text-green-600 mt-2">
            {currency} {paymentAnalytics.summary.paid.amount.toLocaleString()}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {" "}
            {paymentAnalytics.summary.paid.count} orders
          </p>
        </div>

        {/* ------Pending---------- */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>

          <h2 className="text-2xl font-bold text-yellow-600 mt-2">
            {currency}{" "}
            {paymentAnalytics.summary.pending.amount.toLocaleString()}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {" "}
            {paymentAnalytics.summary.pending.count} orders{" "}
          </p>
        </div>

        {/* ----------Refunded--------- */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Refunded</p>

          <h2 className="text-2xl text-purple-600 font-bold mt-2">
            {currency}{" "}
            {paymentAnalytics.summary.refunded.amount.toLocaleString()}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {" "}
            {paymentAnalytics.summary.refunded.count} orders
          </p>
        </div>

        {/* -------Success Rate-------- */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Success Rate</p>

          <h2 className="text-2xl font-bold text-gray-500 mt-2">
            {paymentSuccessRate}%
          </h2>

          <p className="text-sm text-gray-500 mt-1">Paid vs Failed Payments</p>
        </div>
      </div>

      {/* ===============Chart Section=========== ===============================*/}
      {/* =====================Payment Method=================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-4">Payment Methods</h2>

            <p className="text-sm text-gray-500">
              Distribution of payment methods
            </p>
          </div>

          <div className="w-full h-80">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    nameKey="name"
                    outerRadius={110}
                    label={renderPaymentLabel}
                  >
                    {paymentMethodData.map((entry, index) => {
                      const colors = [
                        "#3B82F6",
                        "#10B981",
                        "#F59E0B",
                        "#8B5CF6",
                        "#EF4444",
                      ];

                      return (
                        <Cell
                          key={entry.name}
                          fill={colors[index % colors.length]}
                        />
                      );
                    })}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [`${value} Orders`, "Count"]}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                No payment data available
              </div>
            )}
          </div>
        </div>

        {/* ======================Payment Status=================== */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-4">Payment Status</h2>
            <p className="text-sm text-gray-500">
              Breakdown of payment statuses
            </p>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart data={paymentStatusData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                />

                <Tooltip formatter={(value) => [`${value} Orders`, "Count"]} />

                <Bar dataKey="orders">
                  {paymentStatusData.map((entry, index) => {
                    const colors = {
                      Paid: "#10B981",
                      Pending: "#F59E0B",
                      Failed: "#EF4444",
                      Refunded: "#8B5CF6",
                    };
                    return (
                      <Cell
                        key={index}
                        fill={colors[entry.name] || "#6B7280"}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --------------Top Selling Products ----------------- */}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mt-8">
        <div className="mb-5">
          <h2 className="text-lg font-medium text-gray-800">
            Top Selling Products
          </h2>

          <p className="text-sm text-gray-500">
            Best performing products by units sold
          </p>
        </div>
        {/* ----------------Table----------------------- */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="py-3 px-3 font-medium">#</th>

                <th className="py-3 px-3 font-medium">Product</th>

                <th className="py-3 px-3 font-medium">Sold</th>

                <th className="py-3 px-3 font-medium">Revenue</th>
              </tr>
            </thead>

            <tbody>
              {topSellingProducts.length > 0 ? (
                topSellingProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-500 last:border-none"
                  >
                    <td className="py-4 px-3 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.productImage || "/placeholder.png"}
                          alt={product.productName || "Product"}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholder.png";
                          }}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />

                        <span className="text-sm font-medium text-gray-800">
                          {" "}
                          {product.productName}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-sm text-gray-600">
                      {product.totalSold}
                    </td>

                    <td className="py-4 px-3 text-sm font-medium text-gray-800">
                      {currency} {product.totalRevenue}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No selling data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -----------------Recent Orders---------------------------- */}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div>
            <h2 className="text-lg text-gray-800">Recent Orders</h2>

            <p className="text-sm text-gray-500">
              Latest orders from your store{" "}
            </p>
          </div>

          <Link
            to="/orders"
            className="text-sm font-medium text-gray-700 hover:text-black transition"
          >
            View All →{" "}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="py-3 px-3 font-medium">Order</th>

                <th className="py-3 px-3 font-medium">Customer</th>

                <th className="py-3 px-3 font-medium">Amount</th>

                <th className="py-3 px-3 font-medium">Payment</th>

                <th className="py-3 px-3 font-medium">Status</th>

                <th className="py-3 px-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-100 last:border-none rounded-sm hover:bg-gray-100 transition"
                  >
                    {/* ----------------Order Id------------------- */}

                    <td className="py-4 px-3">
                      <Link
                        to={`/order-details/${order._id}`}
                        className="text-sm font-medium text-gray-800 hover:underline"
                      >
                        #{order._id.slice(-6)}
                      </Link>
                    </td>

                    {/* ------------Customer-------------- */}

                    <td className="py-4 px-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {order.userId?.firstName} {order.userId?.lastName}
                        </p>

                        <p className="text-xs text-gray-500">
                          {order.userId?.email}
                        </p>
                      </div>
                    </td>

                    {/* ---------------Amount------------------- */}

                    <td className="py-4 px-3">
                      <span className="text-sm font-medium text-gray-800">
                        {currency} {order.amount}
                      </span>
                    </td>

                    {/* ------------Payment Status-------------- */}

                    <td className="py-4 px-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                                    ${
                                      order.paymentStatus === "Paid"
                                        ? "bg-green-100 text-green-700"
                                        : order.paymentStatus === "Refunded"
                                          ? "bg-purple-100 text-purple-700"
                                          : order.paymentStatus === "Failed"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-yellow-50 text-yellow-700"
                                    }
                                   `}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* ------------------Order Status---------------- */}

                    <td>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                                   ${
                                     order.orderStatus === "Delivered"
                                       ? "bg-green-100 text-green-700"
                                       : order.orderStatus === "Shipped"
                                         ? "bg-purple-100 text-purple-700"
                                         : order.orderStatus === "Processing"
                                           ? "bg-blue-100 text-blue-700"
                                           : order.orderStatus === "Cancelled"
                                             ? "bg-red-100 text-red-700"
                                             : "bg-yellow-100 text-yellow-700"
                                   }
                                  
                                  `}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* ---------------Date--------------- */}

                    <td className="py-4 px-3">
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No recent orders available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

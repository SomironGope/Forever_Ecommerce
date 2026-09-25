import { useEffect, useState } from "react"
import axios from "axios";

import {LineChart,Line, BarChart,
  Bar,XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';






function Dashboard() {

  const [stats, setStats] = useState ({
    totalUser: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });


  const [monthlyRevenue, setMonthlyRevenue] = useState ([]);

  const [monthlyOrders, setMonthlyOrders] = useState ([])

  const [error, setError] = useState ([]);

  const [loading, setLoading] =  useState (true);




  useEffect (() => {

    const fetchDashboardStats = async () => {


      try {

        setLoading (true)
        setError("");

        const token = localStorage.getItem("adminToken");

        const response = await axios.get (`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard/stats`, 
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        );


        const data = response.data;
         
         console.log("Response:", response);
         console.log("Data:", data);  


        if( !data.success) {
          throw new Error (data.message || "Failed to fetch dashboard data");

        }

       

        setStats (data.stats);

        setMonthlyRevenue (data.monthlyRevenue);
       
        setMonthlyOrders (data.monthlyOrders);


        
      } catch (error) {
        console.error ("Dashboard Error:", error);
       
        setError (error.message || "Something went wrong");
        
      }finally {
        setLoading (false);
      }
    };

    fetchDashboardStats ()
  },[]);


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
      "Dce",
    ];

    return months [month -1];
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
      <div className="flex items-center justify-center min-h-100">
          
             <p className="text-gray-600 text-lg">Loading dashboard...</p>
         
      </div>
    )
  }



  if (error) {
    return (

      <div className="bg-red-100 text-red-600 p-4 rounded-lg">
         <p className="font-medium"> Dashboard Error</p>
         <p>{error}</p>
      </div>
    )
  }



  return (
     <div className="w-full">
        {/* ----------------------Dashboard Title--------------------------- */}
        <div className="mb-8">
            <h1 className="text-2xl font-medium text-gray-800">Dashboard</h1>

            <p className="text-gray-500 mt-1">Overview of your store</p> 
        </div>

        {/* -----------------Statistics Cards------------------------------ */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-3 gap-5 mb-8">

            {/* ----------Total User--------------- */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
               <p className="text-gray-500 text-sm">Total Users</p>

               <h2 className="text-3xl font-medium text-gray-800 mt-2">{stats.totalUser}</h2>
            </div>

           
                 {/* ----------Total Products--------------- */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
               <p className="text-gray-500 text-sm">Total Products</p>

               <h2 className="text-3xl font-medium text-gray-800 mt-2">{stats.totalProducts}</h2>
            </div>


                  {/* ----------Total Revenue--------------- */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
               <p className="text-gray-500 text-sm">Total Reveneu</p>

               <h2 className="text-3xl font-medium text-gray-800 mt-2">{stats.totalRevenue}</h2>
            </div>
          

                  {/* ----------Pending Orders--------------- */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
               <p className="text-gray-500 text-sm">Pending Orders</p>

               <h2 className="text-3xl font-medium text-gray-800 mt-2">{stats.pendingOrders}</h2>
            </div>


                  {/* ----------Delivered Orders--------------- */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
               <p className="text-gray-500 text-sm">Delivered Orders</p>

               <h2 className="text-3xl font-medium text-gray-800 mt-2">{stats.deliveredOrders}</h2>
            </div>
        </div>


        {/* -------------------------Charts--------------------------------- */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* ------------------Revenue Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-lg font-medium text-gray-800">Monthly Revenue</h2>

                    <p className="text-sm text-gray-500">Revenue from paid orders</p>
                </div>


                <div className="w-full h-80">
                    <ResponsiveContainer width= "100%" height= "100%" >

                       <LineChart data={revenueChartData} >
                          
                           <CartesianGrid strokeDasharray= "3 3" />
                            
                            <XAxis dataKey = "name" />

                            <YAxis />

                            <Tooltip formatter={(value) => [`⃁ ${value}`, "Revenue" ]} />

                              <Line type= "monotone"
                              dataKey= "revenue"
                              strokeWidth={3}
                              dot = {{r: 4}}
                              />
                       </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* ------------------------Orders Chart-------------------- */}

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-lg font-medium text-gray-800">Monthly Orders</h2>
               
                    <p className="text-sm text-gray-500">Number of orders received</p>
                </div>

                <div className="w-full h-80">

                  <ResponsiveContainer width= "100%" height= "100%">

                     <BarChart data = {ordersChartData}>
                       <CartesianGrid strokeDasharray= "3 3" /> 

                        <XAxis dataKey = "name" />

                        <YAxis allowDecimals = {false} />

                        <Tooltip />

                        <Bar dataKey= "orders" name= "Orders" radius={[5,5,0,0]} />
                     </BarChart>
                  </ResponsiveContainer> 
                    
                </div>

            </div>
        </div>
     </div>
  )



}

export default Dashboard
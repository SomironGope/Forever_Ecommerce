import { User } from "../models/userModels.js";
import { Product } from "../models/productModels.js";
import { Order } from "../models/orderModels.js";





// =============================Admin Dashboard Statistics=====================


export const getDashboardStats = async (req, res) => {
  try {
    
    // ============= Basic Statistics=============================

    const totalUser = await User.countDocuments({
      role: "user"
    });

    const totalProducts = await Product.countDocuments ();

    const totalOrders = await Order.countDocuments ();

    const pendingOrders = await Order.countDocuments ({
      orderStatus: "Pending",
    });

    const deliveredOrders = await Order.countDocuments ({
      orderStatus: "Delivered",
    });


   //=====================
   //======================Total Revenue======================
   //====================== Only count successfully paid orders==================


// const allOrders = await Order.find().select("createdAt");

// console.log(allOrders);


   const revenueResult = await Order.aggregate([

    {
      $match: {
        paymentStatus: "Paid",
        orderStatus: {
          $ne: "Cancelled"
        },
      },
    },

    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$amount",
        },
      },
    },

   ]);


   const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

   // ========================Monthy Revenue =================
   // ========================Last 12 months==================


   const monthlyRevenue= await Order.aggregate ([

    {
       $match : {
        paymentStatus: "Paid",
        orderStatus: {
          $ne: "Cancelled"
        },
       },
    },

    {
      $group: {
        _id: {
          year: {
            $year: "$createdAt"
          },
          month: {
            $month: "$createdAt"
          },
        },
        revenue: {
            $sum: "$amount",
          },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
   ]);


   // =========================Monthly Orders=====================
   const monthlyOrders = await Order.aggregate ([

    {
      $group: {
        _id: {
          year: {
            $year: "$createdAt"
          },
          month: {
            $month: "$createdAt"
          },

        },

        orders: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month":1,
      },
    },

   ]);


   // Format Monthly Revenue======================

   const formattedRevenue = monthlyRevenue.map((item)=> ({
    year: item._id.year,
    month: item._id.month,
    revenue: item.revenue,
   }));


   // Format Monthly Order======================

   const formattedOrder = monthlyOrders.map ((item) => ({
    year: item._id.year,
    month: item._id.month,
    orders: item.orders,
   }));



   // Response================================

   return res.status (200).json({
    success: true,
    stats: {
      totalUser,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,

    },

    monthlyRevenue: formattedRevenue,

    monthlyOrders: formattedOrder,
   });

  } catch (error) {

    console.error ("Dashboard Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    })
  }
}
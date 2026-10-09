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


   // ====================Top Selling Products========================

    const topSellingProducts = await Order.aggregate( [

      {
        $match: {
          paymentStatus: "Paid",
          orderStatus: {$ne: "Cancelled"},
        },
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.productId",
          productName: {$first: "$items.name"},
          productImage: {$first: "$items.image"},
          totalSold: {$sum: "$items.quantity"},
          totalRevenue: {
            $sum: {
              $multiply: [ "$items.price","$items.quantity"],
            },
          },
        },
      },

      {
        $sort: {
          totalSold: -1,
        },

      },

      {
        $limit: 5,
      }
    ]);


    // --------------------------Recent Orders--------------------------

    const recentOrders = await Order.find().populate("userId", "firstName lastName email").sort ({createdAt: -1})
    .limit(5)



    // ===================Payment Analytics===================

    const totalOnlinePayments = await Order.countDocuments({
      paymentMethod: "ONLINE"
    });

    const successfullPayment = await Order.countDocuments ({
      paymentMethod: "ONLINE",
      paymentStatus: "Paid",
    });

    const failedPayments = await Order.countDocuments ({
      paymentMethod: "ONLINE",
      paymentStatus: "Failed",
    });

    const refundedPayments = await Order.countDocuments ({
       paymentMethod: "ONLINE",
       paymentStatus: "Refunded",
    });
   
    const pendingPayments = await Order.countDocuments ({
      paymentMethod: "ONLINE",
      paymentStatus: "Pending",
    });

    const successRate = totalOnlinePayments > 0 
                       ? Number (
                          (successfullPayment / totalOnlinePayments) * 100
                       ).toFixed(1)
                       : 0;
 
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

    paymentAnalytics: {
      totalOnlinePayments,
      successfullPayment,
      failedPayments,
      refundedPayments,
      pendingPayments,
      successRate,
    },

    monthlyRevenue: formattedRevenue,

    monthlyOrders: formattedOrder,

    topSellingProducts,

    recentOrders,
   });

  } catch (error) {

    console.error ("Dashboard Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    })
  }
}


// ==========================Get Payment Analytics ===========================


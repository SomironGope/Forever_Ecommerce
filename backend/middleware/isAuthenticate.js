import jwt from 'jsonwebtoken';
import { User } from '../models/userModels.js';



export const isAuthenticate = async (req, res, next) => {
  try {
    // JWT token extraction

    const authHeader = req.headers.authorization;
    // Bearer token validation

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing or invalid"
      });
    }

    const token = authHeader.split(" ") [1];
    let decoded;

    try {
      // Token Verification

      decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

    } catch (error) {
      // Token expiry Handling

      if(error.name === "TokenExpiredError") {
        return res.status(401).json({
          success:false,
          message: "The access token has expired"
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid access token"
      });
    }
    // User lookup
   
    const user = await User.findById (decoded.id).select("-password -otp -otpExpired");
    if(!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Attach user to request
    req.user = user;
     req.id = user._id;
     
    return next()



  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// --------------------Admin ----------------------//

export const isAdmin = async (req, res, next) => {
  // Admin middlware logic

  if(req.user && req.user.role === 'admin') {
    return  next ();
  }else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin only'
    })
  }
};
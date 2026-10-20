import { User } from '../models/userModels.js';
import {Session} from '../models/userSessionModel.js'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { json } from 'stream/consumers';



export const adminLogin = async (req, res) => {
  try {
     const {email, password} = req.body;
     
     // Check required fields
     if(typeof email !== "string" || !email.trim() || typeof password !== "string" || !password)
       {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
     }

     // Check environment secrets//

     if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      throw new Error ("Authentication secrets are not configured.")
     }
     // Normalize email
     const normalizeEmail = email.trim().toLowerCase();

     // Find admin
     const admin = await User.findOne({email:normalizeEmail});
     
     
     if(!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
     }

     // Check admin role
     if(admin.role !== "admin") {
      return res.status(403).json({
        success:false,
        message: "Access denied: Admin only",
      });

     }
     
     if (!admin.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account before logging in."
      })
     }
 
     if (admin.isBlocked) {
      return res.status (403).json ({
        success: false,
        message: "Your account has been blocked."
      })
     }
     // Verified password
     const isPasswordMatch = await bcrypt.compare(password, admin.password);

     if(!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

     }
      // Generat access token ( 10 minutes )
     const adminAccessToken = jwt.sign({
      id: admin._id.toString(), 
      role: "admin",
     }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "10m"}
    );

    // Generat refresh token ( 30 days )

    const sessionId = new mongoose.Types.ObjectId();

    const refreshToken = jwt.sign(
      {
        id: admin._id.toString(),
        sid: sessionId,
        role: "admin",
      },

      process.env.REFRESH_TOKEN_SECRET, {expiresIn: "30d"}
    );

    // Hash refresh token for database storage

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex")


      // Create Session

      const expiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );


      await Session.create({
        _id: sessionId,
        userId: admin._id,
        refreshTokenHash,
        device: "Admin Panel",
        userAgent: req.get("user-agent") || "",
        ipAddress: req.ip || "",
        expiresAt,
      });


      // Set refresh token cookie
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/api/v1/admin",
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // Return access token


    res.status(200).json({
      success: true,
      message: "Admin login successfully",
      adminAccessToken,
      admin: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
      },
    });

  
  } catch (error) {
    console.log("Admin Login Error:", error)

    return res.status(500).json({
      success: false,
      message: "Iternal server error"
    })
  }
}



export const adminLoggedOut = async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/v1/admin",
  };

  try {
    const refreshAdminToken = req.cookies?.refreshToken;

    // Process the session only if the cookie exists.
    if (refreshAdminToken) {
      try {
        const decoded = jwt.verify(
          refreshAdminToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        const { id: adminId, sid, role } = decoded;

        // Validate that this is an admin refresh token.
        if (adminId && sid && role === "admin") {
          const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshAdminToken)
            .digest("hex");

          // Delete only the current admin session.
          const deletedSession = await Session.deleteOne({
            _id: sid,
            userId: adminId,
            refreshTokenHash,
          });

          console.log(
            "Admin session deletion:",
            deletedSession.deletedCount
          );

          // Update legacy login status only if no sessions remain.
          if (deletedSession.deletedCount === 1) {
            const activeSession = await Session.exists({
              userId: adminId,
              expiresAt: {$gt: new Date ()},
            });

            if (!activeSession) {
              await User.findByIdAndUpdate(
                 adminId,{ isLoggedIn: false }
                
              );
            }
          }
        }
      } catch (tokenError) {
        // Invalid or expired tokens must not prevent cookie clearing.
        console.warn(
          "Admin refresh token verification failed:",
          tokenError.message
        );
      }
    }

    // Always clear the correctly named cookie.
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    console.error("Admin logout error:", error);

    res.clearCookie("refreshToken", cookieOptions);

    return res.status(500).json({
      success: false,
      message: "Admin logout failed",
    });
  }
}


export const refreshAdminAccessToken = async (req, res) => {

  try {
    const refreshToken = req.cookies?.refreshToken;

    if ( !refreshToken) {
      return res.status(401).json ({
        success: false,
        message: "Refresh token missing. Please log in again.",
      });
    }

    if ( !process.env.REFRESH_TOKEN_SECRET ||
       !process.env.ACCESS_TOKEN_SECRET
    ) {
      throw new Error ("Authentication secrets are not configured.");
    }

    let decoded;

    try {
       decoded = jwt.verify (
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
       );

    } catch (error) {
      return res.status(401).json ({
        success: false,
        message: "Refresh token expired or invalid. Please log in again.",
      });

    }

    const { id: adminId, sid, role} = decoded;

    if ( !adminId || !sid) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

    const session = await Session.findOne({
      _id: sid,
      userId: adminId,
      refreshTokenHash,
      expiresAt: { $gt: new Date()},
    });

    if (!session) {
      return res.status(401).json ({
        success: false,
        message: "Session expired or revoked. Please log in again."
      });
    }

    const admin = await User.findById(adminId).select("_id role isBlocked isVerified");

    if (!admin || admin.role !== "admin" || role !== "admin" || admin.isBlocked || !admin.isVerified) {
      return res.status(401).json ({
        success: false,
        message: "Admin account unavailable. Please log in again."
      });
    }

    const adminAccessToken = jwt.sign ({ id: admin._id, role: admin.role},
       process.env.ACCESS_TOKEN_SECRET, 
      {expiresIn: "10m"});

      return res.status(200).json({
        success: true,
        adminAccessToken,
      })
  } catch (error) {

    console.error ("Refresh admin access token error:", error);

    return res.status(500).json({
      success:false,
      message: "Failed to refresh admin access token."
    })
    
  }
}
 
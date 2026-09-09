import { User } from '../models/userModels.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';



export const adminLogin = async (req, res) => {
  try {
     const {email, password} = req.body;
     
     // Check required fields
     if(!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
     }
     // Normalize email
     const normalizeEmail = email.trim().toLowerCase();

     // Find admin
     const admin = await User.findOne({email:normalizeEmail});
     
     
     if(!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
     }

     // Check admin role
     if(admin.role !== "admin") {
      return res.status(403).json({
        success:false,
        message: "Access denied: Admin only",
      });

     }
     
     // Compare password
     const isPasswordMatch = await bcrypt.compare(password, admin.password);

     if(!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

     }
      // Create access token
     const accessToken = jwt.sign({
      id: admin._id, role: admin.role
     }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "7d"}
    );

    res.status(200).json({
      success: true,
      message: "Admin login successfully",
      accessToken,
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
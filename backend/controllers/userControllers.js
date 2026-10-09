
import {User} from '../models/userModels.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto, { randomInt } from 'crypto';
import { verifyEmail } from '../emails/emailVerify.js';
import validator from 'validator';
import {Session} from '../models/userSessionModel.js';
import cloudinary from '../utils/cloudinary.js';
import { sendOTPMail } from '../emails/forgotOTPVerify.js';
import mongoose from 'mongoose';
import path from 'path';




// ---------------------------------Register----------------------

export const register = async (req,res ) => {
  try {
    const {firstName, lastName, email, password} = req.body;

    if(!firstName || !lastName || !email || !password) {
      return res.status (400).json ({
        success: false,
        message: "All fields are required!"
      })
    };
   

    // Checking email find or exists
    const normalizEmail = email.trim().toLowerCase();

    // Checking Email / It's valid or invalid

   if (!validator.isEmail(normalizEmail)) {
    return res.status (400).json ({
      success: false,
      message: "Please enter a valid email!"
    })
   };

   const exists = await User.findOne({email:normalizEmail});

   if(exists) {
    return res.status(400).json({
      success: false,
      message: "User already exists"
    })
   };

   
   
   // Password validation

   if(!validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase:1,
    minUppercase:1,
    minNumbers:1,
    minSymbols:1
   })) {
    return res.status(400).json({
      success: false,
      message: "Password must be contain uppercase, lowercase, number and special character!"
    })
   };



  // Hashing Password using bcrypt//

   const hashPassword = await bcrypt.hash(password,10)

   // Creacting New User 

   const newUser = await User.create({
    firstName,
    lastName,
    email: normalizEmail,
    password: hashPassword
   })

   // Generating OTP Code 

   const otp = randomInt(100000,1000000).toString();
   
   newUser.otp = otp    // Save OTP in database

   // OTP Expired Time
   newUser.otpExpired = new Date(Date.now() + 10 *60 *1000);

   await newUser.save();

   await verifyEmail(otp,normalizEmail) // Send OTP for verification email

   return res.status(201).json ({
    success: true,
    message: "Registration successful. Please verify your email.",
    user: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email
    
    }
   });

  } catch (error) {
    return res.status(500).json({
      success:false,
      message: error.message
    })
  }
};


//--------------------------Verify OTP------------------------------

export const verifyOTP = async (req,res) => {
  try {
    // Check Required fields// 

    const { otp } = req.body;
    if(!otp) {
      return res.status(400).json({
        success: false,
        message: " OTP is required"
      });
    }
    


    // Find User
    const user = await User.findOne ({ otp });
   
     // User exists
     if(!user) {
      return res.status(400).json ({
        success: false,
        message: "Invalid OTP"
      });
     }

    // Already verified

    if(user.isVerified) {
      return res.status(400).json({
        success:false,
        message: "User is already verified"
      })
    }
    // Active OTP exists

     if(!user.otpExpired) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP found'
      })
    }
    // OTP expired

    if(user.otpExpired < new Date()){
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    } 
    

    // Clear OTP
     
    user.otp = null;
    user.isVerified = true;
    user.otpExpired = null;

    // Save User

    await user.save();

    // Email verified successfully

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


// ----------------------------Resend OTP// One Time Password-------
export const resendOTP = async (req, res) => {
  try {
     // Check required fields
    const {email} = req.body;
    
    if(!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    // Normalize Email

    const normalizeEmail = email.trim().toLowerCase();

    // Find User
    const user = await User.findOne({email:normalizeEmail});
    // User exists
    if(!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    // Email already verified

    if(user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified"
      });
    }

    // Generate 6- digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    verifyEmail(otp, normalizeEmail) // OTP send in email for verification
 // OTP send in email for verification
    user.otp = otp // Save OTP in Database

    // OTP Expired
    user.otpExpired = new Date(Date.now() + 2 * 60 * 1000);
    // Save User

     await user.save();

    // OTP Sent Successfully
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });


  } catch (error) {
    return res.status (500).json({
      success: false,
      message: error.message
    });
  }
}

// ---------------------User Login ----------------------------------

export const login = async (req, res) => {
  try {

    // Required Field Validation
    const {email, password} = req.body;


    if(typeof email !== "string" || typeof password !== "string" ||
      !email.trim() || !password
    ) {
      return res.status(400).json({
        success:false,
        message: "Email and password are required"
      })
    }

    // Normalize Email 
    const normalizedEmail = email.trim().toLowerCase();

    // Find user

    const existingUser = await User.findOne({email:normalizedEmail});
    
    if(!existingUser){
      return res.status(401).json({
          success: false,
        message: "Invalid email or password"
      });  
    }
    
 

    // Verify password before revealing account status

    const isPasswordValid = await bcrypt.compare(password,existingUser.password);

    if(!isPasswordValid) {
      return res.status(401).json({
        success:false,
        message: "Invalid email or password"
      });
    }

       // Check email verification

    if(!existingUser.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your account before logging in"
      });
    }

    // Check blocked account

    if (existingUser.isBlocked) {
      return res.status(403).json ({
        success: false,
        message: "Your account has been blocked. please contact support"
      })
    }
   
    // Validate toke secrets

    if ( !process.env.ACCESS_TOKEN_SECRET ||
         !process.env.REFRESH_TOKEN_SECRET
       ) {
        throw new Error ("Authentication secrets are not configured");
       }


       // Give the login its own session ID
       const sessionId = new mongoose.Types.ObjectId();

    // Generate Access Token: short-lived

    const accessToken = jwt.sign(
      {
        id:existingUser._id, 
        role: existingUser.role
      },
      process.env.ACCESS_TOKEN_SECRET, {expiresIn:"10m"}
    );
    
    // Generate Refresh Token: tied to this specific session

    const refreshToken = jwt.sign(
      {
        id:existingUser._id,
         role: existingUser.role,
         sid: sessionId.toString(),
        }, 
        process.env.REFRESH_TOKEN_SECRET, 
        {expiresIn:"30d"}
      );
  
   //  Hash Refresh Token 

   const refreshTokenHash = crypto
       .createHash("sha256")
       .update(refreshToken)
       .digest("hex");
   
       // Session expires in 30 days
    const expiresAt = new Date(
       Date.now() + 30 * 24 * 60 * 60 * 1000
    )

    const userAgent = req.get("user-agent") || "";

  

  // Create a seperate session; do not delete other devices

    await Session.create({
      _id: sessionId,
     userId: existingUser._id,
     refreshTokenHash,
     device: userAgent || "Unknown",
     userAgent,
     ipAddress: req.ip || "",
     expiresAt,
  
});

// This legacy field is global, not device-specific.
// Keep in true while the user has active sessioin.

if ( !existingUser.isLoggedIn) {
  existingUser.isLoggedIn = true;
  
  await existingUser.save();
}

     // Set the refresh-token Cookie

     res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
     });


      // Return user data

    return res.status(200).json({
      success: true,
      message: `Welcome back ${existingUser.firstName}`,
      accessToken,
      user: {
        id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        role: existingUser.role
      }
    });
  

  
  } catch (error) {
    // Keep detailed error in server logs, not API response.
    console.error ("Login error:", error);

    return res.status(500).json({
      success:false,
      message: "Internal server error"
    })
  }
}
// -----------------------User Log Out-------------------------------
export const logout = async (req,res) => {
  try {
   console.log("Refresh token exists:", !!req.cookies?.refreshToken);
    const refreshToken = req.cookies?.refreshToken;

    // Get the current device's refresh token

    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const {id: userId, sid } = decoded;

      if (userId && sid) {
        const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

        // Delete only this device's session

        console.log("Decoded session ID:", sid);
console.log("Decoded user ID:", userId);
console.log("Token hash:", refreshTokenHash);

        const deletedSession = await Session.deleteOne({
          _id: sid,
          userId,
          refreshTokenHash
        });

         // Check whether the user has another active session

         if (deletedSession.deletedCount === 1) {
           
           const activeSession = await Session.exists({
              userId,
              expiresAt: { $gt: new Date() }
             });

               // Update the legacy global login status
        
        if (!activeSession) {
          await User.findByIdAndUpdate(userId, {
            isLoggedIn: false
          });
        }
       }  
      }
    }

    // Clear the refresh-token cookie

    res.clearCookie ("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    })
   
    return res.status(200).json({
      success:true,
      message: "User logged out successfully"
    })
  } catch (error) {
    console.error ("Logout error:", error);
     
    // clear the cookie even if the token is invalid

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully"
    })
  }
}

// -------------------------FORGET PASSWORD--------------------------

export const forgotPassword = async (req, res) => {
  try {
    
    const {email} = req.body;

    if(!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne ({email});

    if(!user) {
      return res.status (404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------Generate 6-digit OTP --------------------------

    const otp = Math.floor (100000 + Math.random() * 900000).toString();

    // ---------------------------OTP Expires after 5 minutes---------------------

    const otpExpired = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;

    user.otpExpired = otpExpired;

    user.isOtpVerified = false;

    await user.save()

    // ----------------------Send OTP email---------------------------------------

    sendOTPMail(otp, email); 

    return res.status (200).json({
      success: true,
      message: "OTP sent successfully"
    });
 

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// --------------------------------OTP Verify--------------------------

export const OTPVerify = async (req, res) => {
  try {

    // -------------Check Request Fields--------------

    const {otp} = req.body;

    const {email} = req.params;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "OTP is required",
    });
  }


  // -------------Find User--------------------
  const user = await User.findOne ({email});

  if(!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  if(user.isOtpVerified) {
    return res.status (400).json({
      success: false,
      message: "User is already verified"
    })
  }

  if(!user.otp) {
    return res.status (400).json ({
      success: false,
      message: "OTP is not generated"
    });
  }

  if(!user.otpExpired) {
    return res.status(400).json({
      success: false,
      message: "OTP expiry information is missing"
    })
  }


  // ---------------------------Check OTP Expiry------------------------

  if (user.otpExpired < new Date()) {
    return res.status (400).json ({
      success: false,
      message: "OTP has expired, please request a new one"
    });
  }


  // ------------------------------Check OTP-------------------------------

  if(otp !== user.otp) {
    return res.status (400).json({
      success: false,
      message: "OTP is invalid"
    });
  }

  // --------------------------OTP Verified---------------------------------

  user.otp = null;
  user.otpExpired = null

  user.isOtpVerified = true;

  await user.save();


  return res.status (200).json({
    success: true,
    message: "OTP verified successfully"
  });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// ----------------------Change Password------------------------------

export const changePassword = async (req, res) => {

  try {

    // ------------------Check User Fields---------------------------
    const {newPassword, confirmPassword} = req.body;

    const {email} = req.params;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json ({
        success: false,
        message: "All fields are required"
      });
    }

    if(newPassword !== confirmPassword) {
      return res.status (400).json({
        success:false,
        message: "Password do not match"
      });
    }

    // -------------------Find Uesr ------------------------

    const user = await User.findOne ({email}); 

    if(!user) {
      return res.status (404).json ({
        success: false,
        message: "User not found"
      });
    }

    // -------------Make sure OTP was verified----------------

    if(!user.isOtpVerified) {
      return res.status(400).json ({
        success: false,
        message: "Please verify OTP first"
      });
    }
    
    if (!validator.isStrongPassword (newPassword, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })) {
      return res.status(400).json({
        success: false,
        message: "Password must be contain uppercase, lowercase, number and special character!"
      })
    }


    // ---------------Hash Password------------------------
    const hashPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashPassword;

    // -------------------Clear verification state-----------------
    user.isOtpVerified = false;

    await user.save();

    return res.status(200).json ({
      success: true,
      message: "Password changed successfully"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ------------------------User Profile--------------------------------

export const profile = async (req,res) => {
  try {

    const user = await User.findById (req.user._id).select("-password -otp -otpExpired");
  

    if(!user) {
      return res.status (404).json({
        success: false,
        message: "User not found",
      });
    }


    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// -----------------------Get All User---------------------------------

export const getAllUser = async (req,res) => {
  try {
     const users = await User.find().select("-password -otp -otpExpired");

     return res.status(200).json({
      success:true,
      users,
     });
     
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ----------------------Update Profile --------------------------------

export const updateProfile = async (req, res) => {
  try {

    const {firstName, lastName, address, city, postalCode, phone} = req.body;

    const user = await User.findById (req.user._id);

    if(!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
     // ------------------------------PROFILE IMAGE------------------------------------

    let profilePicUrl = user.profilePic;
    let profilePicPublicId = user.profilePicPublic;

    if(req.file) {

      // ---------------------------UPLOAD NEW IMAGE------------------------------------------
      const uploadResult = await new Promise((resolve, reject) =>{

        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "profile",
          },
          (error, result) => {
            if(error) reject(error);

            else resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      // -------------------------DELETE OLD IMAGE FROM only after new upload succeeds CLOUDINARY-----------------------------

      if(user.profilePicPublic) {
        await cloudinary.uploader.destroy(user.profilePicPublic);
      }


      // Set New Image information

      profilePicUrl = uploadResult.secure_url;
      profilePicPublicId = uploadResult.public_id;
    }
    // -------------------------------Update Fields only if Provided---------------------

     if (firstName !== undefined) {
      user.firstName = firstName.trim();
     }

     if (lastName !== undefined) {
      user.lastName = lastName.trim();
     }

     if (address !== undefined) {
      user.address = address.trim();
     }

     if (city !== undefined) {
      user.city = city.trim();
     }

     if (postalCode !== undefined) {
      user.postalCode = postalCode
     }

     if (phone !== undefined) {
      user.phone = phone
     }


    //  ----------------------------------PROFILE IMAGE-------------------------------------------

     user.profilePic = profilePicUrl;

     user.profilePicPublic = profilePicPublicId;

     await user.save();
  
    //--------------------RETURN UPDATE USER----------------------------------------

    const updateUser = await User.findById (user._id).select("-password -otp -otpExpired");
  
    return res.status(200).json ({
      success: true,
      message: "Profile updated successfully",
      user: updateUser,
    });

    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ----------------------------Block User------------------------------

export const blcokUser = async (req, res) => {

  try {
    
    const {userId} = req.params;

    const user = await User.findById (userId);

    if (!user) {
      return res.status (404).json ({
        success: false,
        message: "User not found",
      });
    }

    if (req.user.role === "admin") {
      return res.status (403).json ({
        success: false,
        message: "Admin account cannot be blocked"
      });
    }

    user.isBlocked = true;

    await user.save ();
    return res.status(200).json ({
      success: true,
      message: "User blocked successfully",
    });

  } catch (error) {
    console.log ("User Blocked Error:", error);
    return res.status (500).json ({
      success: false,
      message: error.message,
    })
  }
}


// ------------------------Unblock User---------------------

export const unblockedUser = async (req, res) => {
  try {
    
     const {userId} = req.params;

     const user = await User.findById (userId);
     if (!user) {
      return res.status (404).json ({
        success: false,
        message: "User not found",
      });
     }

     user.isBlocked = false;

     await user.save();

     return res.status(200).json ({
      success: false,
      message: "User unblocked successfully",
     });


  } catch (error) {
    console.log ("Unblocked User Error:", error);

    return res.status (500).json({
      success: false,
      message: error.message
    })
  }
}

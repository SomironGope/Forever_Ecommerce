
import {User} from '../models/userModels.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { verifyEmail } from '../emails/emailVerify.js';
import validator from 'validator';
import {Session} from '../models/userSessionModel.js';
import cloudinary from '../utils/cloudinary.js';
import { sendOTPMail } from '../emails/forgotOTPVerify.js';






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

   const exists = await User.findOne({email:normalizEmail});

   if(exists) {
    return res.status(400).json({
      success: false,
      message: "User already exists"
    })
   };

   // Checking Email / It's valid or invalid

   if (!validator.isEmail(normalizEmail)) {
    return res.status (400).json ({
      success: false,
      message: "Please enter a valid email!"
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

   const otp = Math.floor(100000 + Math.random () * 900000);
   
   newUser.otp = otp    // Save OTP in database

   // OTP Expired Time
   newUser.otpExpired = new Date(Date.now() + 10 *60 *1000);

   await newUser.save();

   verifyEmail(otp,normalizEmail) // Send OTP for verification email

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


export const login = async (req, res) => {
  try {

    // Required Field Validation
    const {email, password} = req.body;

    if(!email || !password) {
      return res.status(401).json({
        success:false,
        message: "Email and password are required"
      })
    }

    // Normalize Email // 
    const normalizedEmail = email.trim().toLowerCase();

    // check user exists

    const existingUser = await User.findOne({email:normalizedEmail});
    
    if(!existingUser){
      return res.status(401).json({
          success: false,
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

    // Compare hashed password

    const isPasswordValid = await bcrypt.compare(password,existingUser.password);

    if(!isPasswordValid) {
      return res.status(401).json({
        success:false,
        message: "Invalid email or password"
      });
    }

    // Generate Token

    // Generate Access Token

    const accessToken = jwt.sign({id:existingUser._id, role: existingUser.role},process.env.ACCESS_TOKEN_SECRET, {expiresIn:"10m"});
    
    // Generate Refresh Token
    const refreshToken = jwt.sign({id:existingUser._id, role: existingUser.role}, process.env.REFRESH_TOKEN_SECRET, {expiresIn:"30d"});
  
   // Crypto Hash Refresh Token 

   const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    existingUser.isLoggedIn = true;
    await existingUser.save();

    // Manage Session
    const existingSession = await Session.findOne ({userId: existingUser._id})
  
    if(existingSession) {
      await Session.deleteOne({userId: existingUser._id});
    };

    await Session.create({
     userId: existingUser._id,
     refreshTokenHash,
     device: req.headers["user-agent"],
     userAgent: req.headers["user-agent"],
     expiresAt: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
  )
});

     // Cookie 

     res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000
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
    return res.status(500).json({
      success:false,
      message: error.message
    })
  }
}

export const logout = async (req,res) => {
  try {
    const userId = req.id;
    await Session.deleteMany({userId});
    await User.findByIdAndUpdate(userId, {isLoggedIn: false});

    // res.clearCookie ("refreshToken",{
    //   httpOnly: true,
    //   secure: process.env
    // })

    return res.status(200).json({
      success:true,
      message: "User logged out successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// -------------------------FORGET PASSWORD--------------------------------

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


// -----------------------------------OTP Verify--------------------------

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

// ----------------------Change Password----------------------------------

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

      // -------------------------DELETE OLD IMAGE FROM CLOUDINARY-----------------------------

      if(profilePicPublicId) {
        await cloudinary.uploader.destroy(profilePicPublicId);
      }


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




import mongoose from "mongoose";



const userSchema = new mongoose.Schema({
firstName: {type: String, 
  required:[true, "First name is required"],
  trim: true,
  maxLength: [50, "First name cannot exceed 50 characters"],
},

lastName: {type: String,
   required: [true, "Last name is required"],
   trim: true,
   maxLength: [50, "Last name cannot exceed 50 characters"],
  },

profilePic: {type: String,
   default: "", 
   trim: true},  // Cloudinary profile img url

profilePicPublic: {type:String, 
  default: "", 
  trim: true}, // Cloudinary profile img deletaion

email: {type: String,
   required: [true,"Email is required"], 
   unique: true,
   lowercase: true,
   trim: true,
   maxLength: [254, "Email cannot exceed 254 characters"],
   match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please provide a valid email address",
   ],
  },


password: {type: String, 
  required: [true, "Password is required" ],},


role: {
  type: String,
  enum: ["user", "admin"],
  default: "user"
},

isBlocked: {
  type: Boolean,
  default: false,
},

isVerified: {
  type: Boolean,
  default: false
},

isLoggedIn: {
  type: Boolean, 
  default: false
},

otp: {
  type: String,
  default: null
},

otpExpired: {
  type: Date,
  default: null
},
isOtpVerified: {
  type: Boolean, 
  default: false
},

address: {
  type: String,
  trim: true,
  maxLength: [200, "Address cannot exceed 200 characters"],
},

city: {
  type: String,
  trim: true,
  maxLength: [100, "City cannot exceed 100 characters"],

},

postalCode: {
  type:String,
  trim: true,
  maxLength: [20, "Postal code cannot exceed 20 characters"],
},

phone: {
  type:String,
  trim: true,
  maxLength: [25, "Phone number cannot exceed 25 characters"],
},


},
{
  timestamps:true,
}
);


export const User = mongoose.model("User", userSchema);
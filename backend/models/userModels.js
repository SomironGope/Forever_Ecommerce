import mongoose from "mongoose";



const userSchema = new mongoose.Schema({
firstName: {type: String, required:true},
lastName: {type: String, required: true},
profilePic: {type: String, default: ""},  // Cloudinary profile img url
profilePicPublic: {type:String, default: ""}, // Cloudinary profile img deletaion
email: {type: String, required: true, unique: true},
password: {type: String, required: true},


role: {
  type: String,
  enum: ["user", "admin"],
  default: "user"
},

isVerified: {type: Boolean,default: false},
isLoggedIn: {type: Boolean, default: false},
otp: {type: String, default: null},
otpExpired: {type: Date, default: null},
isOtpVerified: {type: Boolean, default: false},

address: {type: String},
city: {type: String},
postalCode: {type:String},
phone: {type:String}


},{timestamps:true});


export const User = mongoose.model("User", userSchema);
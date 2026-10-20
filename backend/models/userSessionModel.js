import mongoose from "mongoose";


const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  refreshTokenHash: {
    type: String,
    required: true,
    unique: true,
  },

  device: {
    type: String,
    default: "Unknown"
  },
  userAgent: {
    type: String,
    default: "",
  },
  
  ipAddress: {
    type: String,
    default: "",
    
  },
  expiresAt: {
    type: Date,
    required: true,
    index: {expires: 0} 
  }
},{timestamps: true});


export const Session = mongoose.model("Session",userSessionSchema);
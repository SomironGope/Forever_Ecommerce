import mongoose from "mongoose";


const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refreshTokenHash: {
    type: String,
    required: true
  },

  device: {
    type: String,
    default: "Unknown"
  },
  userAgent: {
    type: String
  },
  
  ipAddress: {
    type: String
  },
  expiresAt: {
    type: Date,
    required: true
  }
},{timestamps: true});


export const Session = mongoose.model("Session",userSessionSchema);
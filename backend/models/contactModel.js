import mongoose from "mongoose";



const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters."]
    },
    email: {
      type: String,
      trim: true,
      required: true,
     
    },
    subject: {
      type: String,
      trim: true,
      maxLength: [250, "Subject cannot exceed 150 characters."]
    },
    message: {
      type: String,
      trim: true,
      maxLength: [5000, "Message cannot exceed 5000 characters."]
    }
  }, {timestamps: true}
)


export const Contact = mongoose.model ("Contact", contactSchema)
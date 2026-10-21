
import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing from environment variables");
    }

    await mongoose.connect(`${mongoURI}/forever-ecommerce`);

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;

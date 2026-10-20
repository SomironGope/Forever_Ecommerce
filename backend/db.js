import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/forever-ecommerce`);

    console.log("MongoDB Connection Successfully!");
  } catch (error) {
    console.error(error);
    console.log('MongoDB Connection Failed')
  }
};

export default connectDB;





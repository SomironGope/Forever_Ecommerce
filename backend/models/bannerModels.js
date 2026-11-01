
import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },

    subTitle: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      required: true,
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    mobileImage: {
      type: String,
      default: "",
    },

    mobileImagePublicId: {
      type: String,
      default: "",
    },

    buttonText: {
      type: String,
      default: "Shop Now",
    },

    link: {
      type: String,
      default: "/collection",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Banner =
  mongoose.models.Banner ||
  mongoose.model("Banner", bannerSchema);

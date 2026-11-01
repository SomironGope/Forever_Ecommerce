import {Banner} from "../models/bannerModels.js";
import cloudinary from "../utils/cloudinary.js";


export const addBanner = async (req, res) => {

  try {

    const {title, subTitle,  buttonText, link,sortOrder} = req.body;

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message: "Banner image is required"
      });
    }

    const result = await cloudinary.uploader.upload(
      req.file.path, 
      {
        folder: "mern_banners",
        resource_type: "image"
      }
    );

    const banner = await Banner.create({
      title,
      subTitle,
      image: result.secure_url,
      imagePublicId: result.public_id,
      buttonText,
      link,
      sortOrder: Number(sortOrder) || 0,
    });

    res.status(201).json({
      success: true,
      message: "Banner added successfully",
      banner,
    });

    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


  // List active banners for customers

  export const listBanner = async (req, res) => {
    try {
      const banners = await Banner.find({isActive: true})
      .sort({sortOrder: 1})
      .select("-imagePublicId");
      

      return res.json({
        success: true,
        banners,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // List all banners for admin
  export const allBanners = async (req, res) => {

    try {
      const banners = await Banner.find({}).sort({sortOrder: 1});

      res.json({
        success: true,
        banners,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }


  // Delete Banner

  export const deleteBanner = async (req, res) => {
    try {
      
      const banner = await Banner.findById (req.params.id);

      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Banner not found"
        });
      }
     
      // Delete desktop image from cloudinay

      if (banner.imagePublicId) {
        await cloudinary.uploader.destroy(
          banner.imagePublicId,
          {
            resource_type: "image"
          }
        );
      }

     
      await Banner.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Banner deleted successfully",
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
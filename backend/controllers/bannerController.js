import {Banner} from "../models/bannerModels.js";
import cloudinary from "../utils/cloudinary.js";


export const addBanner = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      buttonText,
      link,
      sortOrder
    } = req.body;

    // Validate image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required"
      });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "mern_banners",
          resource_type: "image"
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    // Save banner in MongoDB
    const banner = await Banner.create({
      title,
      subTitle,
      image: result.secure_url,
      imagePublicId: result.public_id,
      buttonText,
      link,
      sortOrder: Number(sortOrder) || 0
    });

    return res.status(201).json({
      success: true,
      message: "Banner added successfully",
      banner
    });

  } catch (error) {
    console.error("Add Banner Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


  // all active banners for customers

  export const allBanner = async (req, res) => {
    try {
      const banners = await Banner.find({isActive: true})
      .sort({sortOrder: 1, createdAt: -1})
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

  // Admin: List all banners for admin

  export const listBanner = async (req, res) => {
    try {
      const banners = await Banner.find({})
       .sort({sortOrder: 1, createdAt: -1});

       return res.status(200).json({
        success: true,
        banners
       })
    } catch (error) {
      console.error("List Banner Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
 

// Admin: Toggle Banner Status

export const toggleBannerStatus = async (req, res) => {
  try {
     const {id} = req.params;

     const banner = await Banner.findById(id);

     if (!banner) {
      return res.status(404).json({
        success:false,
        message: "Banner not found"
      });
     }

     banner.isActive = !banner.isActive;

     await banner.save();

     return res.status(200).json({
      success: true,
      message: `Banner ${
        banner.isActive ? "activated" : "deactivated"
      } successfully`,
      banner
     })
  } catch (error) {
    console.error ("Toggle Banner Status Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    })
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
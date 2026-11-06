import express from "express";
import { addBanner,  allBanner,  deleteBanner, listBanner, toggleBannerStatus } from "../controllers/bannerController.js";
import { isAuthenticate, isAdmin } from "../middleware/isAuthenticate.js";
import { singleUpLoadImg } from "../multer/Multer.js";


const bannerRouter = express.Router();

// -----------------------Admin Add Banner--------------------------

bannerRouter.post ('/add-banner',isAuthenticate, isAdmin, singleUpLoadImg, addBanner);

//--------------------Customer: Get active banners---------------------

bannerRouter.get ('/all-banner', allBanner);

// ------------------Admin: Get all Banners------------------------
bannerRouter.get ('/list-banner',isAuthenticate, isAdmin, listBanner);

// ---------------------Admin: Activate / Deactivate Banner----------------

bannerRouter.patch("/status/:id", isAuthenticate,isAdmin, toggleBannerStatus);

// ---------------------Admin: Delete banner from admin panel---------------

bannerRouter.delete ('/delete/:id', isAuthenticate, isAdmin, deleteBanner);



export default bannerRouter;
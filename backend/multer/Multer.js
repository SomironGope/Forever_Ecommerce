
import multer from "multer";

const storage = multer.memoryStorage();

// Single image upload
export const singleUpLoadImg = multer({ storage }).single("file");

// Multiple image upload (existing limit for image updates)
export const multipleUploadImg = multer({ storage }).array("file", 5);

// Product creation (up to 25 images across all color variants)
export const addProductUpload = multer({ storage }).array("file", 25);

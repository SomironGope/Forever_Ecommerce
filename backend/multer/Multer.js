import multer from "multer";



const storage = multer.memoryStorage();

// Sinlge Img Upload

export const singleUpLoadImg = multer({storage}).single('file');

// Multiple Img Upload

export const multipleUploadImg = multer({storage}).array('file',5);
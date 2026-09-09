import express from 'express';
import { changePassword, forgotPassword, getAllUser, login, logout, OTPVerify, profile, register, resendOTP, updateProfile, verifyOTP } from '../controllers/userControllers.js';
import { isAdmin, isAuthenticate } from '../middleware/isAuthenticate.js';
import { singleUpLoadImg } from '../multer/Multer.js';


const router = express.Router();



router.post ('/register',register);

router.post ('/verify-otp', verifyOTP);

router.post ('/resend-otp', resendOTP);

router.post ('/login',login);

router.post ('/logout',isAuthenticate,logout);

router.post ('/forgot-password', forgotPassword);

router.post ('/forgot-password/verify-otp/:email', OTPVerify);

router.post ('/forgot-password/change-password/:email', changePassword);

router.get ('/profile',isAuthenticate,profile);

router.put ('/profile', isAuthenticate,singleUpLoadImg ,updateProfile);

router.get ('/all-user',isAuthenticate,isAdmin, getAllUser);



export default router;
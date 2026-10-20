import express from 'express';
import { adminLoggedOut, adminLogin, refreshAdminAccessToken } from '../controllers/adminController.js';

const adminRouter = express.Router();




adminRouter.post('/login',adminLogin);

adminRouter.post ('/logout', adminLoggedOut);

adminRouter.post ("/refresh", refreshAdminAccessToken);


export default adminRouter;
import express from 'express';
import { isAdmin, isAuthenticate } from '../middleware/isAuthenticate.js';
import { getDashboardStats} from '../controllers/dashboardControllers.js';



const dashBoardRouter = express.Router();


dashBoardRouter.get ('/stats', isAuthenticate, isAdmin, getDashboardStats);



export default dashBoardRouter;
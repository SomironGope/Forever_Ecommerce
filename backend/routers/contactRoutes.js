import express from 'express';
import { contactController } from '../controllers/contactController.js';


const contactRouter = express.Router();



contactRouter.post ('/send', contactController);



export default contactRouter;
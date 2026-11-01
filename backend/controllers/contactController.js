import validator from "validator";
import { Contact } from "../models/contactModel.js";
import {sendContactEmail} from '../emails/sendContactEmail.js';


export const contactController = async ( req, res ) => {

  try {
    const {name, email, subject, message} = req.body;

    if (typeof name !== "string" ||
        typeof email !== "string" || 
        typeof subject !== "string" ||
        typeof message !== "string" 
     ) {
      return res.status(400).json({
        success: false,
        message: "All fields must be valid text."
      })
     }

     
    const normalizeName = name.trim();
    const normalizeEmail = email.trim();
    const normalizeSubject = subject.trim();
    const normalizeMessage = message.trim();

     if ( !normalizeName || !normalizeEmail || !normalizeSubject || !normalizeMessage) {
      return res.status(400).json ({
        success: false,
        message: "All fields are required "
      });
    }

    if (!validator.isEmail(normalizeEmail)) {
      return res.status (400).json({
        success: false,
        message: "Please enter valid email address."
      });
    }

    if ( normalizeName.length > 100 ) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 100 characters."
      });
    }

    if ( normalizeSubject.length > 250) {
       return res.status(400).json({
        success: false,
        message: "Subject cannot exceed 250 characters"
       })
    }
 
    if ( normalizeMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters."
      })
    }

    await sendContactEmail({
      name: normalizeName,
      email: normalizeEmail,
      subject: normalizeSubject,
      message: normalizeMessage,
    });


    await Contact.create( {
      name: normalizeName,
      email: normalizeEmail,
      subject: normalizeSubject,
      message: normalizeMessage
    }
  )

    return res.status(200).json({
      success: true,
      message: "Message sent successfully."
    })

  } catch (error) {
    console.error("Contact Controller error:", error);

    return res.status (500).json ({
      success: false,
      message: error.message
    })
  }
}
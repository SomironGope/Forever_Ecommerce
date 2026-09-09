import nodeMailer from 'nodemailer';


export const verifyEmail = (otp,email) => {
  const transporter = nodeMailer.createTransport ({
    service : 'gmail',
    auth : {
      user : process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });


  const mailConfig = {
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Verification mail',
    html: `<div style="background:#f4f4f5;font-family:Arial,sans-sefif;padding:40px 20px;margin-top:10px;border-radius:12px;">
    <div style="max-width:500px;background:#eff6ff; border:2px dashed #2563eb flex-direction:column; border-radius:10px; padding:20px; margin:25px 0;">
     <div style="max-width:500px;margin:0 auto;background:#ffffff;border-radius:12px;padding:40px 30px;">
     <h2 style="color:2563eb;margin-bottom:10px">Email Verification</h2>
     <p style="color:#4b5563;font-size: 16px;line-height: 1.6;">Welcome to Forever E-commerce</p>
    <p style="color:#4b5563;font-size:16px;" >Use the verification code below to verify your account</p>
         <h1 style="margin:0;color:#2563eb;letter-spacing:8px;text-align:center;">${otp}</h1>
    
    </div>
    
   
    
    <p style="color:#ef4444;font-weight:bold;text-align-center">This OTP will expire in 10 minutes.</p>
     <p style="color:#6b7280;font-size:14px;margin-top:25px;"> If you did not create an account, please ignore this email. </p>
      <hr style=margin:25px 0;border:none;border-top:1px solid #e5e7eb;"
     <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2026 Forever E-Commerce. All rights reserve.
   
      </div>
    </div>
    
    `
  }
  transporter.sendMail (mailConfig, function (error,info) {
    if(error) {
     console.log(error);
     return;
     
    }
     console.log("OTP sent successfully!")
      console.log(info)
  });
};



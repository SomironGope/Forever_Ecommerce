import nodeMailer from 'nodemailer';


export const sendOTPMail = (otp,email) => {
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
    subject: 'Password Reset',
    html: `<div style="background:#f4f4f5;font-family:Arial,sans-sefif;padding:40px 20px;margin-top:10px;border-radius:12px;">
    <div style="max-width:500px;background:#eff6ff; border:2px dashed #2563eb flex-direction:column; border-radius:10px; padding:20px; margin:25px 0;">
     <div style="max-width:500px;margin:0 auto;background:#ffffff;border-radius:12px;padding:40px 30px;">
     <h2 style="color:2563eb;margin-bottom:10px">Password Reset</h2>
     <p style="color:#4b5563;font-size: 16px;line-height: 1.6;">Welcome to Forever E-commerce</p>
    <p style="color:#4b5563;font-size:16px;" >We received a request to reset your password. Use the OTP Below to continue.</p>
         <h1 style="margin:0;color:#2563eb;letter-spacing:8px;text-align:center;">${otp}</h1>
    
    </div>
    
   
    
    <p style="color:#ef4444;font-weight:bold;text-align-center">This OTP will expire in <strong>5 minutes </strong>.</p>
     <p style="color:#6b7280;font-size:14px;margin-top:25px;"> If you did not request a password reset, you can safely ignore this email.  </p>
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
     console.log(`OTP email sent to ${email}`);
      console.log(info)
  });
};



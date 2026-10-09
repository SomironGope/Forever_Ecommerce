import nodeMailer from 'nodemailer';



export const sendOrderConfirmationEmail = async (email, firstName, order) => {

  const transporter = nodeMailer.createTransport ({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    }
  });

  const mailConfig = {
    from: process.env.MAIL_USER,
    to: email,
    subject: `Order Confirmation - ${order._id}`,
    html: `
      <div style="width:100%;background:#f4f4f5;font-family:Arial,sans-serif;padding:40px 20px;">
         <div style="background:#eff6ff;max-width:600px;margin:0 auto; text-align:center;border:2px dashed #2563eb;border-radius:10px;padding:20px;">
             <div style="max-width:500px; margin:0 auto; padding:20px;">
               <div style="background:#2563eb;padding:15px;border-radius:8px;color:#fff;margin-bottom:20px;">
                  <h1 style="margin:0;font-size:24px;">Forever E-Commerce></h1>
               </div>
                <h2 style="font-size:18px; font-weight:600; color:#222222; margin-bottom:10px;">Thank you for your order, ${firstName}</h2>
                <p style="font-size:16px; font-weight:500; margin-bottom:10px;" >Your order has been placed successfully.</p>
             
                <p style="font-size:18px;font-weight:600;"><strong>Order ID:</strong> ${order._id}</p>
                 <p style="font-size:18px;font-weight:500;"><strong>Amount:</strong> ${order.amount} SR </p>

                <p style="font-size:16px; font-weight:500;"><strong>Payment Method:</strong> ${order.paymentMethod} </p>

                <p style="font-size:16px"><strong>Status:</strong> ${order.paymentStatus}</p>

               <p style="font-size:14px" >We will notify you when your order status changes.</p>

               <br/>
                </div>

                 <p style="font-size:14px; text-align:center;">Forever E-Commerce Team </p>
         </div>
        
      </div>
    
     
      `
  }
  
  try {
     const info = await transporter.sendMail (mailConfig);
     
     console.log(`Order Confirmation sent to  ${email}`);

     console.log(info.messageId);
  } catch (error) {
    console.error ("Email Send Error:",error);
  }
    
}
import nodeMailer from 'nodemailer';


export const sendOrderStatusEmail = async (email, firstName, order) => {


  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    }
  });

  const mailConfig = {
    from : process.env.MAIL_USER,
    to: email,
    subject: `Order status update - ${order._id}`,
    html: `
        <div style="font-family:Arial, sans-serif;max-width:600px; margin:auto padding:20px;">
             <h2>Order Status Update</h2>

             <p>Hello ${firstName}</p>
             
             <p> Your order <strong>#${order._id}</strong> has been updated.</p>

             <p><strong>Current Status:</strong>${order.orderStatus}</p>

             ${
              order.orderStatus === "Processing" 
              ? `<p>Your order is now being processed.</p>`
              : order.orderStatus === "Shipped"
              ? `<p>Great news! Your order has been shipped.</p>`
              : order.orderStatus === "Delivered"
              ? `<p>Your order has been delivered successfully.</p>`
              : order.orderStatus === "Cancelled"
              ? `<p>Your order has been cancelled.</p>`
              : `<p>Your order status has been updated.</p>`
             }

             <p> Thank you for shopping with Forever Ecommerce.</p>
        </div>

      `
  }

  await transporter.sendMail (mailConfig);
};

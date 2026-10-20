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
  <div style="margin:0;padding:30px 12px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#171717;">

    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">

      <div style="background:#171717;padding:26px 20px;text-align:center;">
        <h1 style="margin:0;font-size:26px;letter-spacing:4px;color:#ffffff;">
          FOREVER
        </h1>
        <p style="margin:8px 0 0;font-size:11px;letter-spacing:2px;color:#d4d4d4;">
          YOUR FASHION, YOUR STYLE
        </p>
      </div>

      <div style="padding:32px 24px;">

        <h2 style="margin:0 0 18px;text-align:center;font-size:23px;font-weight:700;color:#171717;">
          Order Status Update
        </h2>

        <p style="font-size:15px;line-height:1.7;color:#404040;">
          Hello ${firstName},
        </p>

        <p style="font-size:14px;line-height:1.8;color:#525252;">
          Your order has been updated. Please find your
          latest order information below.
        </p>

        <div style="margin:24px 0;padding:20px;background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;">

          <p style="margin:0 0 18px;font-size:14px;color:#737373;">
            Order Number
            <br>
            <strong style="display:inline-block;margin-top:6px;font-size:16px;color:#171717;">
              #${order._id}
            </strong>
          </p>

          <p style="margin:0;font-size:14px;color:#737373;">
            Current Status
            <br>
            <span style="display:inline-block;margin-top:8px;padding:7px 12px;background:#e5e7eb;border-radius:20px;font-size:13px;font-weight:700;color:#171717;">
              ${order.orderStatus}
            </span>
          </p>

        </div>

        <p style="font-size:14px;line-height:1.8;color:#404040;">
          ${
            order.orderStatus === "Processing"
              ? "Your order is being prepared. We will keep you updated as it progresses."
              : order.orderStatus === "Shipped"
              ? "Great news! Your order has been shipped and is on its way to you."
              : order.orderStatus === "Delivered"
              ? "Your order has been delivered successfully. We hope you love your purchase!"
              : order.orderStatus === "Cancelled"
              ? "Your order has been cancelled. Please contact our support team if you need assistance."
              : "Your order status has been updated. Please check the details above."
          }
        </p>

        <div style="margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0 0 8px;font-size:14px;color:#404040;">
            Thank you for shopping with Forever.
          </p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#171717;">
            The Forever Team
          </p>
        </div>

      </div>

       `
  }

  await transporter.sendMail (mailConfig);
};

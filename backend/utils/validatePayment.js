import axios from "axios";



const validatePayment = async (val_id) => {
  const url = process.env.SSLCOMMERZ_IS_LIVE === "true" 
  ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
  : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";


  const response = await axios.get(url, {
    params: {
      val_id,
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      format: "json",
    },
  });
 
  return response.data;

};

export default validatePayment;



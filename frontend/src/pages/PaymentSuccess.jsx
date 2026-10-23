import { useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import {ShopContext} from '../context/ShopContext';



function PaymentSuccess() {
  
  const {token} = useContext (ShopContext)
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [success, setSuccess] = useState(false);


  // --------------------------------Verify Payment---------------------------------
  useEffect(() => {

    const verifyPayment = async () => {
      try {
        const paymentId = searchParams.get("id");
        const status = searchParams.get("status");
        const message = searchParams.get("message");

        //------------------ Payment Id is required--------------------

        if (!paymentId) {
          setSuccess(false);
          return;
        }
         // -------------------Payment Failed---------------------------
         if (status === "failed") {
          navigate ('/payment/failed');
          return;
         }


        if (message && message.toLocaleLowerCase().includes("cancel")){
          navigate ('/payment/cancel');

          return;
        }

        if (!token) {
          console.error ("Access token not found");
          setSuccess(false);
          return;
        }

        const response = await api.post(
          "/api/v1/payment/moyasar/verify",
          {
            paymentId,
          },
          
        );


        if (response.data.success) {
          setSuccess(true);
        }
      } catch (error) {
        console.error(
          "Payment verification error:",
          error.response?.data || error.message
        );

        setSuccess(false);

      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, token, navigate]);





  if (loading) {
    return (
       <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">  
              <h2 className="text-xl font-semibold">Verifying payment...</h2>

              <p className="mt-2 text-gray-500">Please wait while we confirm your payment.</p>
         </div>
      </div>
    )
  }

  if (!success) {
    return (
      <div className=" min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
            <h2 className="text-xl mb-4 font-semibold text-red-600">Payment verification failed</h2>

             <p className="mt-2 text-gray-500">We could not verify your payment.</p>
        <button onClick={() => navigate("/")} className="mt-5 rounded bg-black px-6 py-2 text-white cursor-pointer ">Go Home</button>
        </div>
      
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center">
        <div className="text-center">
              <h2 className="text-2xl font-semibold text-green-600">Payment Successful 🎉</h2>
             <p className="mt-2 text-gray-500">Your payment has been approved.</p>

        </div>
    
      <button onClick={() => navigate("/orders")}className="mt-5 rounded bg-black px-6 py-2 text-white cursor-pointer">
        View My Orders
      </button>
    </div>
  );
}

export default PaymentSuccess;
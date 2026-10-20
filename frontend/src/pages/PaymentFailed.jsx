import { useNavigate } from "react-router-dom";


function PaymentFailed() {

  const navigate = useNavigate ();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-gray-200 text-center bg-white p-8 shadow-sm">
             {/* ---Failuer Icon--- */}
             <div className="mx-auto m-2 flex h-16 w-16 itemc-center justify-center rounded-full bg-red-100 text-3xl">
               <p className="text-center mt-3">❌</p>
             </div>
             
             <h2 className="text-2xl font-semibold text-gray-800">Payment Failed  </h2>

            <p className="mt-3 text-sm leading-6  text-gray-500">
              We couldn't confirm your payment. Please check your payment details or try again.
              If money was deducted, contact support before making another payment.

              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                 <button onClick={()=> navigate ('/cart')} className="mt-5 bg-black text-white px-6 py-2 rounded cursor-pointer hover:bg-gray-800 transition">
                  Try Again
                  </button>
                 
              </div>

           
        </div>
    </div>
  )
}

export default PaymentFailed;
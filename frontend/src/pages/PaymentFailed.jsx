import { useNavigate } from "react-router-dom";


function PaymentFailed() {

  const navigate = useNavigate ();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
             <h2 className="text-2xl font-semibold text-red-600">Payment Failed ❌ </h2>
            <p className="mt-2 text-gray-500">Your payment could not be completed.</p>

            <button onClick={()=> navigate ('/cart')} className="mt-5 bg-black text-white px-6 py-2 rounded cursor-pointer hover:opacity-70 transition">Try Again</button>
        </div>
    </div>
  )
}

export default PaymentFailed;
import { useNavigate } from "react-router-dom";


function PaymentCancel() {
 
  const navigate = useNavigate ();


  return (

    <div className="min-h-[60vh] flex items-center justify-center"> 

       <div className="text-center">
           <h2 className="text-2xl font-semibold text-yellow-600">Payment Cancelled ⚠️ </h2>

            <p className="mt-2 text-gray-500">You cancelled the payment process.</p>

            <button onClick={()=> navigate ('/cart')} className="bg-black text-white px-6 py-2 rounded mt-5 cursor-pointer hover:opacity-70 transition">Return To Cart</button> 
       </div>

    </div>
  )
}

export default PaymentCancel;
import { useNavigate } from "react-router-dom";


function PaymentCancel() {
 
  const navigate = useNavigate ();


  return (

    <div className="min-h-[80vh] flex items-center justify-center"> 

       <div className="w-full min-h-75 max-w-md rounded-lg border border-gray-200 bg-white px-8 shadow-sm text-center">
           {/* -----------------------Cancellation Icon---------------------- */}
           <div className="mx-auto m-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl">
               <p className="text-center mb-2" >⚠️</p>
           </div>
           <h2 className="text-2xl font-semibold text-gray-800">Payment Cancelled  </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">You cancelled the payment process.
              No payment confirmation was received. You can return to your cart and try again.
            </p>
           
           <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

              <button onClick={()=> navigate ('/cart')}
               className="bg-black text-white px-6 py-3  text-sm rounded  cursor-pointer hover:bg-gray-800 transition">
                Return To Cart</button> 
           </div>
            
       </div>

    </div>
  )
}

export default PaymentCancel;
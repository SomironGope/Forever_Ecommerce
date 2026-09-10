import axios from "axios";
import { useState, useRef} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toast";


function OTPVerify() {

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef ([]);

  const navigate  = useNavigate ();



  // Get Email from URL//

  const {email} = useParams();
  
  // ----------------------OTP INPUT--------------------------------------
  
  const handleChange = (value, index) => {

    // Only allow number//

    if(!/^\d*$/.test(value)) {

      return;
    }

    const newOTP = [...otp];

    newOTP[index] = value.slice(-1);

    setOtp(newOTP);

    // Move to next input//

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
 
  };


  //-----------------------Backspace------------------------------------

  const handleKeyDown = (e,index) => {
    if(e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }


  // ------------------------------Verify OTP --------------------------------

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error ("Please enter the complete OTP")
    }
    try {
      
      const response = await axios.post (`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/forgot-password/verify-otp/${encodeURIComponent(email)}`,
     {
        otp: otpCode,
      }
    );

    if(response.data.success) {
      toast.success (response.data.message);

      // Go to change password page//

      navigate (`/forgot-password/change-password/${encodeURIComponent(email)}`);
    }
      
    } catch (error) {

      console.error("OTP Verification error:", error);

      toast.error (error.response?.data?.message || "OTP verification failed"); 
      
    }

  }
   





[]



  return (
    <form onSubmit={handleVerifyOTP} className="min-h-screen flex items-center justify-center flex-col">
     
       <div className="w-100 h-auto px-2 mb-5 flex items-center justify-center flex-col rounded-lg">
           <h1 className="pb-10 text-2xl font-extrabold text-black" >Verify OTP</h1>

           <div className="flex flex-col text-center">
              <div className="flex gap-2 items-center justify-center">

                  {
                    otp.map((digit,index) => (
                      <input key={index} ref = {(el) => inputRefs.current[index] = el }
                         
                      type="text" inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e.target.value,index)}
                      onKeyDown={(e) => handleKeyDown(e,index)}

                      className="w-12 h-12 border rounded-lg text-center text-xl outline-none focus:border-purple-500"
                       />
                     
                    ) )
                  }

              </div>

              <p className="text-sm py-5 text-center">
                Enter the 6-digit code sent to your email
              </p>

              <p className="text-sm text-gray-500 break-all">{email}</p>
           </div>

           <button type="submit" className="w-full px-5 py-2 mx-4 border my-7 rounded-2xl bg-linear-to-r from-sky-400 to-purple-600 cursor-pointer border-slate-800 text-sm font-semibold hover:from-orange-400 hover:to-pink-500 hover:text-white transition-all duration-300 ease-in-out">
             Verify OTP
           </button>
       </div>
         
       
    </form>
  )
}

export default OTPVerify;
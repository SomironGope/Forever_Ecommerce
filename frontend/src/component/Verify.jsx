import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


function Verify() {
  


  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const  navigate = useNavigate();


  const handleChange = (value, index) => {
    // Only allow numbers
    if(!/^\d*$/.test(value)) 
      return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    // Move to next input
    if(value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e,index) => {
    // Move back when pressing Backspace
    if(e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index -1]?.focus();
    }
  }
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");
    
    if(otpCode.length !== 6) {
      alert ("Please enter the complete OTP");
      return;
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/verify-otp`, {
          otp: otpCode,
        }
      );

      if(response.data.success) {
        toast.success(response.data.message);

        navigate('/login',);

      }
    } catch (error) {
      console.error("OTP verification error:", error);

      toast.error(error.response?.data?.message);
    }
  }

  // Resend Function//

  const [timeLeft, setTimeLeft] = useState(120);

  const email = localStorage.getItem("email");

  useEffect (() => {
    if(timeLeft <= 0) 
      return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    },1000);

    return () => clearInterval(timer);

  }, [timeLeft]);


  const handleResendOTP = async () => {
    try {
      const {data} = await axios.post(
        `{import.meta.env.VITE_BACKEND_URL}/api/v1/user/resend-otp`,
         {
          email
        }
      );

      if(data.success) {
        toast.success(data.message);

        // restart 2 minutes timer
        setTimeLeft(120);

      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };






  
  return (
    <form onSubmit={handleVerifyOTP} className="min-h-screen flex items-center justify-center flex-col">
        <div className=" w-100 h-auto px-2 mb-5  flex items-center justify-center flex-col rounded-lg ">
          <h1 className="pb-10 text-2xl font-extrabold text-black">Verify Your Email</h1>
      <div className="flex flex-col text-center">

        <div className="flex gap-2 items-center justify-center">
            {otp.map((digit,index) => (
              <input key={index}
              ref= {(el) => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e)=> handleKeyDown(e, index)}
              className="w-12 h-12 border rounded-lg text-center text-xl outline-none" />
            ))}
            
             </div>
             <p className="text-sm sm:text-sm py-5 text-center">Enter the 6-digit code sent to your email</p>
        </div>
          <button type="submit" className=" w-full px-5 py-2 mx-4 border my-7 rounded-2xl bg-linear-to-r from-sky-400 to-purple-600  cursor-pointer border-slate-800 text-sm font-semibold hover:bg-linear-to-r hover:from-orange-400 hover:to-pink-500 hover:text-white transition-all duration-300 ease-in-out">Verify OTP</button>
          <p>Didn't receive the code?</p>
          <div>
              {timeLeft > 0 ? (
                <p>Resend OTP in {Math.floor(timeLeft/ 60 )} :
                {String(timeLeft % 60).padStart(2, "0")}
                </p>
              ) : (
                <button onClick={handleResendOTP}>Resend OTP</button>
              )}
          </div>
         
         
         
         </div>
        
      
    </form>
  )
}

export default Verify;
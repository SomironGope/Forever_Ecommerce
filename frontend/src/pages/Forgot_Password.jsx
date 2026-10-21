import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from '../utils/axiosInstance';


function Forgot_Password() {

  const [email, setEmail] = useState ("")

  const [loading, setLoading] = useState (false);

  const navigate = useNavigate ();



  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim()

    if(!trimmedEmail) {
      toast.error ("Email is required");

      return;
    }

    try {
      setLoading (true);

      const response = await api.post ("/api/v1/user/forgot-password", 
        {
          email: trimmedEmail,
        }
      );

      if(response.data.success) {
        toast.success (response.data.message || "OTP sent successfully");
        navigate (`/forgot-password/verify-otp/${encodeURIComponent(trimmedEmail)}`);
      }else {
        toast.error (response.data.message || "Failed to send OTP")
      }


    } catch (error) {
       toast.error (error.response?.data?.message || "Something went wrong.Please try again.")
    } finally {
      setLoading (false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4"> 

       <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
            
            <h2 className="text-xl font-semibold text-center mb-2">Forgot Password</h2>

            <p className="text-gray-500 text-center mb-6"> Enter your email to receive an OTP</p>

            <form onSubmit={handleSubmit} >
                <label className="block text-sm font-medium mb-2">Email</label>

                <input type="email" placeholder="Enter your email"
                 value={email} onChange={(e) => setEmail (e.target.value)}
                 autoComplete="email"
                 disabled = {loading}
                 required
                className="w-full border-2 border-gray-300 rounded-md px-3 py-2 mb-4 outline-none focus:border-black" />
            
            
            <button
             type="submit"
             disabled = {loading}
              className="w-full bg-black text-white py-2 rounded-md disabled:opacity-50 cursor-pointer" >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            
            </form>
         
       </div>

    </div>
  )
}

export default Forgot_Password;
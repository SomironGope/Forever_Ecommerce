import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// -------------Icons---------------
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";


function ChangePassword() {

   const {email} = useParams ()
 
   const [newPassword, setNewPassword] = useState ("");

   const [confirmPassword, setConfirmPassword] = useState ("");

   const [showPassword, setShowPassword] = useState (false);

   const [showConfirmPassword, setShowConfirmPassword] = useState (false)


   const [loading, setLoading] = useState (false)

   const navigate = useNavigate()




   const submitChangePassword = async (e) => {
      e.preventDefault();
     
      // if (!newPassword || confirmPassword) {
      //    toast.error ("All fields are required");
      //    return ;
      // }

      // if (newPassword !== confirmPassword) {
      //    toast.error ("Password do not match");
         
      //    return;
      // }


      try {

         setLoading (true);

         const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/forgot-password/change-password/${encodeURIComponent(email)}`,
      {
         newPassword,
         confirmPassword,
      }
   );

   if (response.data.success) {
      toast.success (response.data.message);
      navigate ('/login')
   }
         
      } catch (error) {
         console.log("Change Password Error:",error);

         toast.error(error.response?.data?.message || "Failed to Change Password")
      }finally {
         setLoading (false)
      }

   }


   return(
    <div className="min-h-screen flex items-center justify-center px-4"> 

       <div className="w-full h-auto max-w-md bg-white shodow-lg rounded-lg p-6">
            
            <h1 className="text-2xl font-bold text-center mb-6 ">Change Password</h1>

            <form onSubmit={submitChangePassword} className="space-y-4">
                
                <div>
                   <label className="block mb-1">New Password</label>
                  
                  <div className="relative">
                      <input type={showPassword ? "text" : "password" } placeholder="Enter new password" 
                       value={newPassword} 
                       onChange={(e) => setNewPassword (e.target.value)} 
                        className="w-full border rounded-md px-3 py-2 outline-none focus:border-sky-500"/>
                
                <div className="absolute top-2.5 right-2">
                   {
                     showPassword ? <FaEyeSlash onClick={() => setShowPassword(false)} /> :  <IoEyeSharp onClick={() => setShowPassword (true)}/>
                   }
                </div>
                
                  </div> 
                  
                </div>

                <div>
                    <label className="block mb-1">Confirm Password</label>
                     
                     <div className="relative">

                        <input type={showConfirmPassword ? "text" : "password" } placeholder="Enter confirm password"
                          value={confirmPassword}
                           onChange={(e) => setConfirmPassword (e.target.value)}
                           className="w-full border rounded-md px-3 py-2 outline-none focus:border-sky-500" />
                        <div className="absolute top-2.5 right-2 cursor-pointer">

                           {
                              showConfirmPassword ?  <FaEyeSlash onClick={() => setShowConfirmPassword (false)} /> : <IoEyeSharp onClick={() => setShowConfirmPassword (true)}/>
                           }
                          
                        </div>
                     </div>
                    
                </div>

                <button type="submit" className="w-full py-2 rounded-md bg-black text-white cursor-pointer">
                  
                  {
                     loading ? "Updating..." : "Change Password"
                  }
                  </button>


            </form>
         
       </div>

    </div>
  )

}

export default ChangePassword;
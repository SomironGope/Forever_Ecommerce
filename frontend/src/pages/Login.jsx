import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useContext} from 'react';
import {ShopContext} from '../context/ShopContext';
import {toast} from 'react-toastify'
import api from "../utils/axiosInstance";

import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";



function Login() {

   const navigate = useNavigate();

   const {setToken} = useContext(ShopContext);

   const [showPassword, setPassword] = useState (false);
   
   const [loading, setLoading] = useState (false);


   const [formData, setFormData] = useState ({
    email: '',
    password: '',
   })


    const handlChange = (e) => {
      const {name, value} = e.target;
      setFormData((prev) => ( {
               ...prev,
       [name] : value
      
     }))
     };



    const submitHandler = async (e) => {

      e.preventDefault()

      if (loading) return;
      
     setLoading (true);

     try {
       const response = await api.post(
        "/api/v1/user/login", formData,
        {
          withCredentials: true,
        
        }
       );
       
      
       const data = response.data;

       // Valide the login respose

       if(!data.success && !data.accessToken) {
        
        toast.error(data.message || "Login failed.");
        return;

       }
       // Store access - token
        localStorage.setItem("accessToken", response.data.accessToken);
        
        // Update global authentication state
        setToken(response.data.accessToken);
        toast.success(response.data.message);
        navigate('/');
     } catch (error) {
      
      toast.error(error.response?.data?.message || 
        error.message || "Login failed. Please try again.");
     } finally {
      setLoading (false);
     }

    };

  

  return (
    <form onSubmit = {submitHandler} className="flex flex-col items-center w-[90%] sm:max-96 m-auto mt-14 gap-4 text-gray-800">
         <div className="inline-flex items-center gap-2 mb-2 mt-10">

           <p className="prata-regular text-3xl">Log In</p>
           <hr className="border-none h-[1.5px] w-8 bg-gray-800"/> 

          </div>

           <input 
              type ="email" 
              id= 'email' 
              name = 'email' 
              value={formData.email} 
              autoComplete="email"
              required
              onChange={handlChange} placeholder="Enter your email" 
              className="w-full px-3 py-2 sm:w-100 text-sm border-2 border-gray-600 rounded-sm outline-none focus:border-sky-500"
            />

           <div className="w-full sm:w-100 relative">

             <input   
               type= {showPassword ?  "text" : "password" }
               id= 'password' name="password" 
               value={formData.password} 
               onChange = {handlChange}
               autoComplete="current-password"
               required
               placeholder="Enter your password"
               className="w-full px-3  py-2 sm:w-100 text-sm border-2 border-gray-600 rounded-sm outline-none focus:border-sky-500" 
               />

              <button type="button"
              onClick={() => setPassword ((prev) => !prev)}
              aria-label= {showPassword ? "Hide password" : "Show password"}
               className="absolute top-2.5 right-3">

                {
                  showPassword ? <FaEyeSlash /> : <IoEyeSharp />
                }
                   
                             
              </button>
           </div>
           


            <div className="w-full flex justify-between text-[11px] sm:text-sm mt-2 sm:w-100">
               <div className="flex gap-2">
                   <p className="shrink-0">You don't have an account? </p>
                
                   <Link to = '/signup'>
                       <p className="cursor-pointer hover:text-sky-900">Sign Up</p>
                  </Link>
              
               </div>
               
              <Link to = '/forgot-password'>
               <p className=" cursor-pointer hover:text-sky-900">Forgot your password</p>
              </Link>
              
            </div>
            <button 
             type="submit" 
             disabled = {loading}
             className="text-sm px-8 py-2 mt-5 tracking-wider bg-black text-white rounded-sm cursor-pointer transition-all ease-in-out duration-300 hover:bg-pink-500 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                 {loading ? "Logging in..." : "Login"}
            </button>
    </form>
  )
}

export default Login;
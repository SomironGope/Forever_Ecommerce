import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useContext} from 'react';
import {ShopContext} from '../context/ShopContext';
import {toast} from 'react-toastify'
import axios from 'axios';

import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";



function Login() {
   const navigate = useNavigate();
   const {setToken} = useContext(ShopContext);
   const [showPassword, setPassword] = useState (false)


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
     console.log(formData);

     try {
       const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/login`, formData,{
          headers: {
            "Content-Type": "application/json"
          }
        }
       );
       
       console.log(response.data);

       if(response.data.success) {
     

         console.log("Token from backend:", response.data.accessToken);

        localStorage.setItem("accessToken", response.data.accessToken);


          
        setToken(response.data.accessToken);
        toast.success(response.data.message);
        navigate('/');


      
       }
     } catch (error) {
      toast.error(error.response?.data?.message);
     }
    };

  

  return (
    <form onSubmit = {submitHandler} className="flex flex-col items-center w-[90%] sm:max-96 m-auto mt-14 gap-4 text-gray-800">
         <div className="inline-flex items-center gap-2 mb-2 mt-10">

           <p className="prata-regular text-3xl">Log In</p>
           <hr className="border-none h-[1.5px] w-8 bg-gray-800"/> 

          </div>

           <input className="w-full px-3 py-2 sm:w-100 text-sm border border-gray-600 rounded-sm outline-none  focus:border-sky-500"
            type="email" id= 'email' name = 'email' value={formData.email} 
            onChange={handlChange} placeholder="Enter your email" />

           <div className="w-full sm:w-100 relative">

             <input className="w-full px-3  py-2 sm:w-100 text-sm border border-gray-600 rounded-sm outline-none focus:border-sky-500" 
            type= {showPassword ?  "text" : "password" } id= 'password' name="password" value={formData.password} 
            onChange = {handlChange} placeholder="Enter your password" />

              <div className="absolute top-2.5 right-3">

                {
                  showPassword ? <FaEyeSlash onClick={() => setPassword (false)}/> : <IoEyeSharp onClick={() => setPassword (true)}/>
                }
                   
                             
              </div>
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
            <button type="submit" className="text-sm px-8 py-2 mt-5 tracking-wider bg-black text-white rounded-sm cursor-pointer transition-all ease-in-out duration-300 hover:bg-pink-500 hover:text-gray-800">
                <p>Login</p>
            </button>
    </form>
  )
}

export default Login;
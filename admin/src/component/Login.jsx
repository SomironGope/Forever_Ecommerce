import { useState } from "react";
import {toast} from 'react-toastify';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function Login ({setToken}) {

   const navigate = useNavigate()
   
  const [formData, setFormData] = useState({
    email: '',
    password: '',

  })


  const handleChang = (e) => {
    const {name, value} = e.target;

    setFormData((prev) => ({
      ...prev,
      [name] : value,
    }));
  };


  const adminFormSubmit = async (e) => {
    e.preventDefault();
    console.log("formData", formData);

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/login`;

    try {
       const response = await axios.post( url, formData);

       console.log("API Response:", response.data);

       if(response.data.success){
        localStorage.setItem("adminToken", response.data.accessToken);

          setToken(response.data.accessToken);

          toast.success(response.data.message);
          navigate('/add')
        }
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      console.log("SERVER ERROR:", error.response?.data);

      toast.error(error.response?.data?.message || "Admin login failed")
    }
  }

  return (
    <div className="w-full min-h-screen  flex items-center justify-center">
      <div className=" w-full h-100 rounded-md pt-8 max-w-md px-4 bg-gray-300">
        <h1 className="text-center text-2xl  md:text-3xl  font-semibold leading-none tracking-wider">
          Admin Panel
        </h1>
        <form onSubmit = {adminFormSubmit} className="flex flex-col pt-4 mt-8">
          <p className="pb-2 text-sm sm:text-base font-semibold">
            Email Address
          </p>
          <input
            className="border border-slate-800 px-3 py-2 rounded-md text-blue-950 text-sm sm:text-base outline-none focus:border-sky-500"
            type="text"
            placeholder="your@gmail.com"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChang}
            required
          />

          <p className="py-2 text-sm sm:text-base font-semibold">
            Password
          </p>
          <input
            className=" border border-slate-800 px-3 py-2 rounded-md text-blue-950 text-sm sm:text-base outline-none focus:border-sky-500"
            type="password"
            placeholder="Enter your password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChang}
            required
          />

          <button
            className="self-center bg-pink-500 text-white text-sm sm:text-base font-semibold tracking-wider mt-8  px-6 py-2 md:px-10  rounded-md cursor-pointer border hover:bg-sky-500 transition"
            type="submit" 
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

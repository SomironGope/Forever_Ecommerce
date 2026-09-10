import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";


function Signup() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState (false);




  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(formData);

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/register`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/verify");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submitHandler}
      className="flex flex-col items-center w-[90%] sm:max-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Sign Up</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <input
        className="w-full px-3 py-2 sm:w-100 text-sm border border-gray-600 rounded-sm outline-none focus:border-sky-500"
        type="text"
        id="firstName"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="Enter your first name"
        required
      />
      <input
        className="w-full px-3 py-2 sm:w-100 text-sm border border-gray-600 rounded-sm outline-none focus:border-sky-500"
        type="text"
        id="lastName"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Enter your last name"
        required
      />

      <input
        className="w-full px-3 py-2 sm:w-100 text-sm border border-gray-600 rounded-sm outline-none focus:border-sky-500"
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        required
      />

      <div className="w-full sm:w-100 relative">

     
      <input
        className="w-full px-3  py-2 sm:w-100 text-sm border border-gray-600 rounded-sm outline-none focus:border-sky-500"
        type= {showPassword ? "text" : "password" }
        id="password" focus:border-sky-500
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        required
      />

       <div className="absolute top-2.5 right-3 ">
           {showPassword ?<FaEyeSlash onClick={() => setShowPassword (false)} /> 
           : <IoEyeSharp onClick={() => setShowPassword (true)} /> }
       </div>

       </div>


      <div className="w-full flex justify-between text-[11px] sm:text-sm mt-2 sm:w-100">
        <div className="flex gap-3">
          <p className="shrink-0">If you have an account? </p>
          <Link to="/login">
            <p className="cursor-pointer hover:text-sky-900">Login</p>
          </Link>
        </div>
      </div>
      <button
        type="submit"
        className="text-sm px-8 py-2 mt-5 tracking-wider bg-black text-white rounded-sm cursor-pointer transition-all ease-in-out duration-300 hover:bg-pink-500 hover:text-gray-800"
      >
        {loading ? <p>Loading...</p> : <p>Signup</p>}
      </button>
    </form>
  );
}

export default Signup;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import api from "../utils/axiosInstance";

function Signup() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

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

  // -------------------Submit Handler--------------------
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/api/v1/user/register", formData);

      if (res.data.success) {
        localStorage.setItem("email", formData.email.trim().toLowerCase());
        toast.success(res.data.message);
        navigate("/verify");
      }
    } catch (error) {
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
        className="w-full px-3 py-2 sm:w-100 text-sm border-2 border-gray-600 rounded-sm outline-none focus:border-sky-500"
        type="text"
        id="firstName"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="Enter your first name"
        autoComplete="given-name"
        required
      />
      <input
        className="w-full px-3 py-2 sm:w-100 text-sm border-2 border-gray-600 rounded-sm outline-none focus:border-sky-500"
        type="text"
        id="lastName"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Enter your last name"
        autoComplete="family-name"
        required
      />

      <input
        className="w-full px-3 py-2 sm:w-100 text-sm border-2 border-gray-600 rounded-sm outline-none focus:border-sky-500"
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        autoComplete="email"
        required
      />

      <div className="w-full sm:w-100 relative">
        <input
          className="w-full px-3 pr-10 py-2 sm:w-100 text-sm border-2 border-gray-600 rounded-sm outline-none focus:border-sky-500"
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 hover:text-sky-600
          focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
        </button>
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
        disabled={loading}
        className="text-sm px-8 py-2 mt-5 tracking-wider bg-black text-white rounded-sm cursor-pointer transition-all ease-in-out duration-300 hover:bg-pink-500 hover:text-gray-800"
      >
        {loading ? <p>Loading...</p> : <p>Signup</p>}
      </button>
    </form>
  );
}

export default Signup;

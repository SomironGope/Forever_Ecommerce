import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
// -------------Icons---------------
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import adminAxios from "../utils/AdminAxios";

function Login() {
  const { setToken } = useContext(AdminContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChang = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const adminFormSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      const response = await adminAxios.post(
        "/api/v1/admin/login",
        { email: formData.email.trim(), password: formData.password },
        {
          withCredentials: true,
        },
      );

      if (response.data.success && response.data.adminAccessToken) {
        localStorage.setItem(
          "adminAccessToken",
          response.data.adminAccessToken,
        );

        setToken(response.data.adminAccessToken);

        toast.success(response.data.message || "Login successful!");

        navigate("/dashboard", { replace: true });
      } else {
        toast.error(response.data.message || "Admin login failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen  flex items-center justify-center">
      <div className=" w-full h-100 rounded-md pt-8 max-w-md px-4 bg-gray-300">
        <h1 className="text-center text-2xl  md:text-3xl  font-semibold leading-none tracking-wider">
          Admin Panel
        </h1>
        <form onSubmit={adminFormSubmit} className="flex flex-col pt-4 mt-8">
          <p className="pb-2 text-sm sm:text-base font-semibold">
            Email Address
          </p>
          <input
            className="border-2 border-slate-800 px-3 py-2 rounded-md text-blue-950 text-sm sm:text-base outline-none focus:border-sky-500"
            type="email"
            placeholder="your@gmail.com"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChang}
            autoComplete="username"
            required
          />

          <p className="py-2 text-sm sm:text-base font-semibold">Password</p>

          <div className="relative">
            <input
              className="w-full border-2 border-slate-800 px-3 py-2 rounded-md text-blue-950 text-sm sm:text-base outline-none focus:border-sky-500"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              name="password"
              id="password"
              value={formData.password}
              autoComplete="current-password"
              minLength={8}
              onChange={handleChang}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
              className="absolute top-3 right-2 cursor-pointer text-lg"
            >
              {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
            </button>
          </div>

          <button
            className="self-center bg-pink-500 text-white text-sm sm:text-base font-semibold tracking-wider mt-8  px-6 py-2 md:px-10  rounded-md cursor-pointer border hover:bg-sky-500 transition disabled:bg-gray-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

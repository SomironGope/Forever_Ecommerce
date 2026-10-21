import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";

import { toast } from "react-toastify";

function Navbar() {
  const { logout } = useContext(AdminContext);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const logoutHandler = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const success = await logout();

      if (success) {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);

      toast.error(
        error.response?.data?.message || "Logout failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full fixed top-0 z-50 bg-linear-to-r from-pink-500 to-violet-500  justify-center p-2  shadow-lg shadow-gray-400 ">
      <div className="w-full h-auto sm:px-6 md:px-8 lg:px-10 xl:px-14 flex  items-center justify-between text-center">
        <div className="flex flex-col h-auto">
          <Link to="/dashboard">
            <h1 className="text-sm font-extrabold sm:text-base md:text-lg lg:text-2xl text-white  tracking-widest">
              SG
            </h1>
            <p className="inline-block text-white text-md font-bold tracking-widest ">
              Somiron
            </p>
          </Link>
        </div>
        <h1 className="text-sm font-extrabold sm:text-base md:text-lg lg:text-2xl  text-white tracking-widest">
          ADMIN PANEL
        </h1>
        <Link to="/dashboard">
          {" "}
          <h1 className="text-sm font-extrabold sm:text-base md:text-lg lg:text-2xl  text-white tracking-widest">
            Dashboard
          </h1>
        </Link>

        <button
          type="button"
          disabled={loading}
          onClick={logoutHandler}
          className="border text-[11px] sm:text-base font-semibold shrink-0  cursor-pointer px-2 py-1 sm:px-4 sm:py-1.5 lg:px-5 lg:py-2 rounded-md bg-linear-to-r from-orange-500 to-violet-500 hover:bg-linear-to-r hover:from-pink-500 hover:to-sky-500"
        >
          {loading ? "Loading..." : "LOGOUT"}
        </button>
      </div>
    </div>
  );
}

export default Navbar;

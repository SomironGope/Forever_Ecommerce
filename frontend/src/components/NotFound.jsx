import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl text-gray-800 font-medium">
        <span className="text-red-500 font-bold">404</span> Not Found
      </h2>
      <p className="text-sm text-gray-500 leading-6">
        The page you are looking for does not exist.
      </p>

      <button
        onClick={() => navigate("/")}
        className="bg-black border border-gray-400 text-white px-3 py-2 mt-3 rounded-sm cursor-pointer hover:opacity-75"
      >
        Back to Home
      </button>
    </div>
  );
}

export default NotFound;

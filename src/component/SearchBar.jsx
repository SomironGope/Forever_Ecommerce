import { assets } from "../assets/products";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

function SearchBar() {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);

  const location = useLocation();

  const visible = location.pathname.includes("collection");

  if (!showSearch || !visible) {
    return null;
  }

  return showSearch && visible ? (
    <div className="bg-gray-200 text-center mt-3 outline-none border-none ">
      <div className="inline-flex bg-gray-200 items-center justify-center px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-1 outline-none py-1 mr-1 rounded-md text-sm border border-sky-500"
          type="text"
          placeholder="Search"
        />
        <img className="w-4" src={assets.searchIcon} alt="Search" />
      </div>
      <img
        onClick={() => setShowSearch(false)}
        className="inline w-4 cursor-pointer"
        src={assets.crossIcon}
        alt="Close"
      />
    </div>
  ) : null;
}

export default SearchBar;

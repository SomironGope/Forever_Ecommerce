import addImg from "../assets/add.png";

import packeage from "../assets/package.png";
import orderImg from "../assets/booking.png";
import peopleUser from "../assets/people.png";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-[18%] min-h-screen border-r-2 border-gray-400 ">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15p] mr-2">
        <NavLink
          to="/add"
          className="flex items-center gap-3 border border-gray-300 px-3 object-fill py-1 rounded-md hover:opacity-55"
        >
          <img src={addImg} alt="addImg" className="w-5" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>

        <NavLink
          to="/products"
          className="flex items-center gap-2.5 border border-gray-300 px-3 object-fill py-1 rounded-md hover:opacity-55"
        >
          <img src={packeage} alt="products" className="w-5" />
          <p className="hidden md:block"> Products</p>
        </NavLink>

        <NavLink
          to="/orders"
          className="flex items-center gap-3 border border-gray-300 px-3 object-fill py-1 rounded-md hover:opacity-55"
        >
          <img src={orderImg} alt="addImg" className="w-5" />
          <p className="hidden md:block">Orders Items</p>
        </NavLink>

        <NavLink
          to="/users"
          className="flex items-center gap-3 border border-gray-300 px-3 object-fill py-1 rounded-md hover:opacity-55"
        >
          <img src={peopleUser} alt="peopleUser" className="w-5" />
          <p className="hidden md:block">Users</p>
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;

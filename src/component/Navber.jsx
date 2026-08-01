import { IoMenu } from "react-icons/io5";

import { FaShoppingCart } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { GoChevronRight } from "react-icons/go";


import { Link, NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";

function Navber() {
   
   const [visibleMenu, setVisibleMenu] = useState (false);
   const {setShowSearch,getCartCount} = useContext(ShopContext);

  return (
    <nav className="bg-[#b5e48c] rounded-sm flex items-center justify-between  px-2 py-5 font-medium border-b-2 border-gray-500">
      <Link to="/">

        <h2 className="text-2xl font-bold text-gray-700 hover:text-[#ba181b]">Forever</h2>
      </Link>

     

      {/* // Nav Links // */}

      <ul className=" hidden sm:flex gap-5 text-sm text-grey-700">
        <li>
          <NavLink className="flex flex-col items-center  gap-1 hover:text-[#ba181b]" to="/">
            <p>HOME</p>
            <hr className=" hidden w-3/4 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
        </li>

        <li>
          <NavLink
            className="flex flex-col items-center  gap-1 hover:text-[#ba181b]"
            to="/collection"
          >
            <p>COLLECTION</p>
            <hr className=" hidden w-3/4 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
        </li>

        <li>
          <NavLink className="flex flex-col items-center  gap-1 hover:text-[#ba181b]" to="/about">
            <p>ABOUT</p>
            <hr className="hidden w-3/4 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
        </li>

        <li>
          {" "}
          <NavLink className="flex flex-col items-center  gap-1 hover:text-[#ba181b]" to="/contact">
            <p>CONTACT</p>
            <hr className="hidden w-3/4 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
        </li>
      </ul>
      <div className="flex items-center gap-6">
        {/* // Search Icon //  */}

          <FaMagnifyingGlass onClick = {() => setShowSearch(true)} className="w-5 cursor-pointer" />

          {/* // User Profile // */}

          <div className="group relative">
               <Link to = '/login'>  <FaUserCircle className="w-5 cursor-pointer"/> </Link>
                 <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-7.5 text-gray-500 ">
                   <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 rounded-md">
                     <NavLink to = 'my-profile'><p className="cursor-pointer hover:text-[#03045e]">My Profile</p></NavLink>
                      <NavLink to = 'orders'><p className="cursor-pointer hover:text-[#03045e]">Orders</p></NavLink>
                       <NavLink to = 'logout'><p className="cursor-pointer hover:text-[#03045e]">Logout</p></NavLink>

                   </div>
                 </div>
          </div>

             {/* Cart Icons */}

          <Link  to = '/cart' className = 'relative'>
            <FaShoppingCart className="w-5 min-w-5"  />
            <p className="absolute -right-1.25 -bottom-1.25 w-4 text-center leading-4 bg-red-600 text-white aspect-square rounded-full text-[8px]">{getCartCount()}</p>

          </Link>

           {/* // Menu Icons // */}
          <IoMenu onClick={() => setVisibleMenu (true)} className="w-5 h-5 font-bold text-black hover:cursor-pointer sm:hidden" />
        
           
       </div>
     
      {/* // Side bar for Small devices Screen // */}
      <div className= {`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visibleMenu ? 'w-full ' : 'w-0'}`}>
           
         <div className="flex flex-col text-gray-800">
            <div onClick = {() => setVisibleMenu (false)} className="flex items-center gap-4 p-3">
                    <GoChevronRight className="h-4 w-4 rotate-180 cursor-pointer" />
                    <p className="text-sm mr-1 ">Back</p>
            </div>
           <div className=" small-device-link flex flex-col text-justify">
            <NavLink onClick = {() => setVisibleMenu (false)}className ='small-device-link py-2 pl-6 border-b border-gray-500' to = '/'>HOME</NavLink>
            <NavLink onClick = {() => setVisibleMenu (false)}className = 'small-device-link py-2 pl-6   border-b border-gray-500' to = '/collection'>COLLECTION</NavLink>
            <NavLink onClick = {() => setVisibleMenu (false)} className = 'small-device-link py-2 pl-6 border-b border-gray-500' to = '/about'>ABOUT</NavLink>
            <NavLink onClick = {() => setVisibleMenu (false)}className = 'small-device-link py-2 pl-6  border-b border-gray-500' to = '/contact'>CONTACT</NavLink>
           </div>
            
         
         </div>

      </div>
      

     
    </nav>
  );
}

export default Navber;

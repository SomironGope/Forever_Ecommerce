import { toast } from "react-toastify";
import { AdminContext } from "./AdminContext"
import axios from 'axios';
import { useEffect, useState } from "react";

import {setAdminAccessTokenUpdater} from "../utils/AdminAxios";

export const AdminContextProvider = (props) => {

  const [token, setToken] = useState (localStorage.getItem("adminAccessToken") || "");

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const currency = '⃁'


  useEffect (() => {
    setAdminAccessTokenUpdater (setToken);

    return () => {
      setAdminAccessTokenUpdater(() => {});
    }
  }, [])

  // -----------------------Logged Out---------------------

  const logout = async () => {

    try {
      
       const response = await axios.post (`${backendUrl}/api/v1/admin/logout`, 
        {},
        {
          withCredentials: true
        }
      )

      if (response.data.success) {

         localStorage.removeItem ("adminAccessToken")
        
        setToken("")
        toast.success (response.data.message || "Admin logged out successful.");
        
       
        return false;
      }
    } catch (error) {
      console.error ("Admin Logout request failed:", error);

      toast.error(error.response?.data?.message || "Admin Logged request failed.")
    
      return false;
    
    }
  }


  
  const value = {
   token,
   setToken,
   backendUrl,
   currency,
   logout
  }
  return (
    <AdminContext.Provider value = {value} >
        {props.children}
    </AdminContext.Provider>
  )
}



export default AdminContextProvider;
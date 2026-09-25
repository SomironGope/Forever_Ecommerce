import { AdminContext } from "./AdminContext"


export const AdminContextProvider = (props) => {

  const adminToken = localStorage.getItem("adminToken")
  const backendUrl = import.meta.env.VITE_BACKEND_URL



  const value = {
   adminToken,
   backendUrl
  }


  return (
    <AdminContext.Provider value = {value} >
        {props.children}
    </AdminContext.Provider>
  )
}



export default AdminContextProvider;
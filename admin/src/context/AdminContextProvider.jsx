import { AdminContext } from "./AdminContext"


export const AdminContextProvider = (props) => {

  const adminToken = localStorage.getItem("adminToken")
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const currency = '⃁'


  const value = {
   adminToken,
   backendUrl,
   currency
  }


  return (
    <AdminContext.Provider value = {value} >
        {props.children}
    </AdminContext.Provider>
  )
}



export default AdminContextProvider;
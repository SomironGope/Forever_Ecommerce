import { useContext, useEffect, useMemo, useState } from "react";
import {AdminContext} from "../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

function Users() {

  const {backendUrl, adminToken} = useContext (AdminContext)

  const [users, setUsers] = useState ([]);
  const [loading, setLoading] = useState (true);


  const [search, setSearch] = useState ("");
  const [roleFilter, setRoleFilter] = useState ("all");
  const [statusFilter, setStatusFilter] = useState ("all");

  const [confirmModel, setConfirmModel] = useState ({
    open: false,
    type: "",
    userId: "",
    userName: "",
  });

  const [actionLoading, setActionLoading] = useState (false);




  //==================================Get All Users========================

  useEffect (() => {

     const fetchUsers = async () => {

      try {

      setLoading (true);

      const response = await axios.get (`${backendUrl}/api/v1/user/all-user`, 
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
        }
      }
      );


      if (response.data.success) {
        setUsers (response.data.users);
        
      } else {
        toast.error (response.data.message || "Failed to fetch users");
      }

    } catch ( error ) {

      console.log("Fetch Users Error:", error);
      toast.error (error.response?.data?.message || "Failed to fetch users");
      
    }finally {
      setLoading (false)
    }
      
     }

     fetchUsers ()

    

  },[backendUrl, adminToken]);



  // ========================Block User ==================================

  const handleBlockUser = async (userId) => {
   


    try {
       setActionLoading (true);

      const response = await axios.put (`${backendUrl}/api/v1/user/block-user/${userId}`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          },
        },
      );

      if (response.data.success) {
        toast.success (response.data.message || "User block successfully");

        // Update only tghe affected user//

        setUsers ((prevUser) => 
          prevUser.map ((user) => user._id === userId 
        ? {...user, isBlocked: true}
         : user)
          )
      } else {
         toast.error (response.data.message || "Failed to block user");
      }
      

    } catch (error) {
      console.log ("Block User Error:", error);

      toast.error (error.response?.data?.message || "Failed to block user")
    } finally {
      setActionLoading (false);

      setConfirmModel ({
        open: false,
        type: "",
        userId: "",
        userName: "",
      });
    }
  };


// ============================Unblock User ================================


const handleUnblockUser  = async (userId )=> {
  


  try {
    setActionLoading (true)
    const response = await axios.put (`${backendUrl}/api/v1/user/unblock-user/${userId}`,
       {},
       {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
       }
    );
      console.log(response.data);
       
      console.log(users); 

    if (response.data.success) {
      toast.success (response.data.message || "User unblock successfully");
    
      setUsers ((prevUser) => 
        prevUser.map ((user) => user._id === userId 
        ? {...user, isBlocked: false}
         : user
         )
        )
    } else {
      toast.error (response?.data?.message || "Failed to unblock user")
    }
  } catch (error) {

    console.log("Unblock User Error:", error);

    toast.error (error.response?.data?.message ||"Failed to unblock user")
    
  }finally {
    setActionLoading (false);

    setConfirmModel({
      open: false,
      type: "",
      userId: "",
      userName: "",
    });
  }
};

// ======================== OpenConfirm Model ===============================
const openConfirmModel = (type, userId, userName) => {
  setConfirmModel ({
    open: true,
    type,
    userId,
    userName,
  });
};

// ======================CloseConfirmModel=================================

const closeConfirmModel = () => {
  if (actionLoading) return;

  setConfirmModel ({
    open: false,
    type: "",
    userId: "",
    userName: "",
  });
};

// ======================Search + Filter====================================

const filteredUsers = useMemo (() => {

  return users.filter ((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();

    const searchText = search.toLowerCase().trim();

    const matchesSearch = fullName.includes(searchText ) || user.email?.toLowerCase().includes(searchText);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesStatus = statusFilter === "all" || (statusFilter === "active" && !user.isBlocked) || 
                          (statusFilter === "blocked" && user.isBlocked);

    return (
       matchesSearch && 
       matchesRole &&
       matchesStatus
    );

  });
}, [ users, search, roleFilter, statusFilter]);

 // ============================= Statistics ============================================

 const totalUsers = users.filter ((user) => user.role === "user").length;

 const blockedUsers = users.filter ((user) => user.role === "user" && user.isBlocked).length;


 const activeUser = totalUsers - blockedUsers;


 const adminUser = users.filter ((user) => user.role === "admin").length;


 // ============================= Loading ===================================


 if (loading) {

  return (
     <div className="min-h-100 flex items-center justify-center">
        <div className="text-gray-500 text-sm">
            Loading users...
        </div>
     </div>
  );
 }


  return (
    <div className="w-full">

      {/* -----------------------------Header---------------------------- */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
              <h1 className="text-2xl font-medium text-gray-800">User Management</h1>

              <p className="text-sm text-gray-500 mt-1">
                 Manage registered users and account status
              </p>
          </div>
      </div>

      {/* ------------------------ Statistics ------------------------------------- */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

         {/* ------------------Total Users--------------------- */}
          <div>
              <p className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"> Total Users</p>

              <p className="text-2xl font-semibold text-gray-800 mb-2 pl-2">{totalUsers}</p>

              
          {/* ----------------------------Active Users ------------------------- */}

          <p className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">Active Users</p>

          <p className="text-2xl font-semibold text-green-600 mt-2 pl-2">{activeUser}</p>
          </div>

      </div>


      {/* ---------------------------------Blocked User------------------------- */}

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">

          <p className="text-sm text-gray-500">Block Users</p>

          <p className="text-2xl font-semibold text-red-600 mt-1">{blockedUsers}</p>
      </div>

      {/* ----------------============----------Admin -------------------------------- */}

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">

          <p className="text-sm text-gray-500">Admin</p>

          <p className="text-2xl font-semibold text-violet-600 mt-1">{adminUser}</p>
      </div>

      {/* ------------------------------------Filters ------------------------------------ */}

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* ----------------Search---------------- */}

             <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>

                  <input type="text" value={search} 
                  onChange={(e) => setSearch (e.target.value)} 
                  placeholder="Search by name or email..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500" />

             </div>

             {/* ------------------Role Filter------------------ */}

             <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>

                  <select value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                     <option value= "all">All Roles</option>
                     <option value= "user">User</option>
                     <option value= "admin">Admin</option>
                  </select>
             </div>

             {/* --------------------Status Filter------------------ */}
             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>

                 <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter (e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">

                  <option value= "all" >All Status</option>

                  <option value= "active">Active</option>

                  <option value= "blocked">Blocked</option>
                    
                 </select>
             </div>
         </div>
      </div>

      {/* -----------------------User Count----------------------- */}

      <div className="flex items-center justify-between py-2">
          <p className="text-sm text-gray-500">Showing {" " }
             <span className="font-medium text-gray-800">{filteredUsers.length}</span> {" "} of {" "}

              <span className="font-medium text-gray-800">{users.length}</span>
              {" "}
              users

          </p>
      </div>

      {/* ---------------------------User Table------------------- */}

       <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

           <div className="overflow-x-auto">

               <table className="w-full text-sm">

                    <thead className="bg-gray-50 border-b border-gray-200">
                    
                        <tr>
                            <th className="text-left px-5 py-4 font-medium text-gray-600">User</th>
                            
                            <th className="text-left px-5 py-4 font-medium text-gray-600">Email</th>

                            <th className="text-left px-5 py-4 font-medium text-gray-600">Role</th>

                            <th className="text-left px-5 py-4 font-medium text-gray-600">Status</th>

                            <th className="text-left px-5 py-4 font-medium text-gray-600">Joined</th>

                            <th className="text-left px-5 py-4 font-medium text-gray-600">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                         {filteredUsers.length > 0 ? (
                           filteredUsers.map((user) => {
                            const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            const isAdminUser = user.role === "admin";

                            return (

                              <tr key={user._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded">
                              {/* -----------------User-------------- */}

                              <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                       {user.profilePic ? (
                                        <img src= {user.profilePic} alt={userName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                       ): (
                                         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium"> 

                                           {user.firstName?.charAt(0).toUpperCase()}
                                          </div>
                                       )
                                      }
                                      <div>
                                          <p className="font-medium text-gray-800">{userName || "Unknown User"}</p>

                                          <p className="text-xs text-gray-400"> ID: {user._id?.slice(-6)}</p>
                                      </div>
                                  </div>
                              </td>

                              {/* --------------------Email-------------------- */}

                               <td className="px-5 py-4 text-gray-600" >{user.email}</td>

                               {/* -------------Role-------------------------- */}

                               <td className="px-5 py-4">
                                  <span className= {`inline-flex px-2.5 py-1 rounded-full text-xs font-medium 
                                   ${isAdminUser ? "bg-violet-100 text-violet-700" 
                                    : "bg-gray-100 text-gray-700"
                                   } `}
                                    
                                   > {user.role}</span>
                               </td>

                               {/* -------------Status----------------------- */}

                               <td className="px-5 py-4">
                                  {isAdminUser ? (
                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                                       Admin
                                    </span>
                                  ) : user.isBlocked ? (
                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                       Blocked
                                    </span>
                                  ) : (
                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                      Active
                                    </span>
                                  )
                                }
                               </td>

                               {/* ---------------------Joined---------------------- */}

                                 <td className="px-5 py-4 text-gray-500">
                                    {user.createdAt ?
                                     new Date (user.createdAt).toLocaleDateString()
                                     : "_"
                                    }
                                 </td>

                                 {/* ----------------------Action------------------------- */}

                                 <td className="px-5 py-4 text-center">
                                   {isAdminUser ? (
                                    <span className="text-xs text-gray-400">Protected</span>
                                   ): user.isBlocked ? (

                                     <button onClick={() => 
                                      openConfirmModel("unblock", user._id, `${user.firstName || ""} ${user.lastName || ""}`.trim())

                                     } className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition">
                                       Unblock
                                     </button>
                                   ) : (
                                     <button onClick={() => 
                                       openConfirmModel(
                                        "block",
                                         user._id, 
                                         `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                       )
                                     } className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition">
                                        Block
                                     </button>
                                   )
                                  }
                                 </td>
                              </tr>
                            )
                           })
                         ) 
                         :(
                           <tr>
                              <th colSpan= "6" className="px-5 py-12 text-center text-gray-500">No user found.</th>
                           </tr>
                         )
                         }
                    </tbody>
               </table>
           </div>

           
       </div>
        {
              confirmModel.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

                   <div className="w-full max-w-md  overflow-hidden bg-white rounded-2xl shadow-2xl">
                       {/* --------------Header---------- */}
                        <div className="px-6  pt-6">
                          {/* --------Icon----------- */}
                            <div>
                                <div className= {`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${  
                                  confirmModel.type === "block" 
                                   ? "bg-red-100 text-red-600"
                                   : "bg-green-100 text-green-600"
                                }`}>

                                  {
                                    confirmModel.type === "block" ? (
                                      <svg 
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-7 h-7"
                                      fill = "none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      >
                                         <path strokeLinecap="round"
                                         strokeLinejoin="round"
                                         d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                        />
                                    </svg>
                                     
                                    ) : (
                                      <svg 
                                       xmlns="http://www.w3.org/2000/svg"
                                       className="w-7 h-7"
                                       fill="none"
                                       viewBox="0 0 24 24"
                                       stroke="currentColor"
                                       strokeWidth={2}
                                      >
                                        <path
                                         strokeLinecap="round"
                                         strokeLinejoin="round"
                                         d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 12c0 5.591 3.824 10.29 9 11.622C17.176 22.29 21 17.591 21 12c0-1.017-.127-2.004-.364-2.944"
                                         />
                                          
                                      </svg>
                                    )}
                                
                                  {/* ------------Title------------ */}

                                  <div className="mt-5 text-center">
                                    </div>

                                  <h2 className="text-xl font-semibold text-gray-800">
                                      {confirmModel.type === "block" 
                                      ? "Block User?"
                                      : "Unblock User?"
                                      }
                                  </h2>

                                  {/* ------------message----------- */}

                                   <p className="text-sm mt-2 text-gray-500 leading-6">
                                    Are you sure you want to {" "} 
                                    <span className="text-gray-700 font-semibold">
                                        {confirmModel.type === "block"
                                        ? "block"
                                        : "unblock"
                                        } 
                                    </span> {" "} this user?
                            
                                   </p>

                                   {/* -----------User Name----------- */}
                                    <div className="mt-2 inline-flex rounded-lg bg-gray-100 px-4 py-2">
                                       <span className="font-semibold text-sm text-gray-800">
                                       {confirmModel.userName}
                                    </span>
                                      </div>

                                      {/* ----------------Warning----------------------- */}
                                   {
                                     confirmModel.type === "block" && (
                                       <div className="mt-5 flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4">

                                         {/* ----------------Warning Icon -------------------*/}
                                          <div className="flex shrink-0">
                                             <svg xmlns="http://www.w3.org/2000/svg"
                                              className="h-5 w-5 text-red-500"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                              >
                                                 <path 
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 9v3.75m0 3h.008v.008H12V15.75zM10.29 3.861-7.5 13A1.5 1.5 0 004.09 19h15.82a1.5 1.5 0 001.3-2.251-7.5-13a1.5 1.5 0 00-2.6 0z" 
                                                    />
                                              </svg>
                                            </div>
                                            <p className="text-sm font-medium text-red-700">
                                               Access  will be restricted
                                            </p>

                                          <p className="m-1 text-xs leading-5 text-red-600">
                                             This user will no longer be able to access their account. until they are unblocked
                                          </p>
                                        </div>
                                     )
                                   }
                                  </div>

                                  {/* --------------Footer------------- */}
                                  <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50 ">

                                    {/* -----Cancel-------- */}
                                      <button
                                       type="button"
                                       onClick={closeConfirmModel}
                                       disabled = {actionLoading}
                                       className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50">
                                        Cancel
                                      </button>

                                      {/* ------------Confirm------------- */}

                                       <button

                                          type="button"
                                       
                                          disabled = {actionLoading}
                                          onClick={() => {
                                          if (confirmModel.type === "block") {
                                            handleBlockUser (
                                            confirmModel.userId,
                                            confirmModel.userName
                                          );
                                        } else {
                                          handleUnblockUser (
                                            confirmModel.userId,
                                            confirmModel.userName
                                          );
                                        } 
                                       }}
                                       className={ `flex min-w-30 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60
                                        ${
                                          confirmModel.type === "block" 
                                          ? "bg-red-600 hover:bg-red-700"
                                          : "bg-green-600 hover:bg-green-700"
                                        } disabled:opacity-60 disabled:cursor-not-allowed
                                       `}>
                                        {
                                          actionLoading ? (
                                            <>
                                              <svg 
                                               className="w-4 h-4 animate-spin "
                                               viewBox="0 0 24 24"
                                               fill="none"
                                               >
                                                 <circle className="opacity-25"
                                                   cx= "12"
                                                   cy = "12"
                                                   r= "10"
                                                   stroke="currentColor"
                                                   strokeWidth= "4"
                                                   />

                                                    <path className="opacity-75" fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                    />
                                               </svg>
                                                Processing...
                                            </>
                                          ) : (
                                            <>
                                             {
                                              
                                              confirmModel.type === "block" 
                                              ? "Block User"
                                              : "Unblock User"
                                              
                                             }
                                             </>
                                          )
                                        }
                                      </button>
                                    </div>
                            </div>
                        </div>
                        
                    </div>
                  </div>
              )
            }
    </div>
  )
}

export default Users;
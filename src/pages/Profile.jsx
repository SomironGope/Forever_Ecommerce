import { useContext, useEffect, useState } from "react";
import {toast} from 'react-toastify'
import axios from 'axios';
import { ShopContext } from "../context/ShopContext";




function Profile() {

   const {user, setUser} = useContext (ShopContext);

   const backendUrl = import.meta.env.VITE_BACKEND_URL;
   const token = localStorage.getItem("accessToken")

   const [image, setImage] = useState (null)

   
   const [saving, setSaving] = useState (false);
   const [editing, setEditing] = useState (false);

   const [loading, setLoading]  = useState (true);

   const [formData, setFormData] = useState ({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''

   });


   useEffect (() => {
    
      const fetchProfile = async () => {
        try {
          const response = await axios.get (`${backendUrl}/api/v1/user/profile`, 
            {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });

          if(response.data.success) {

           const userData = response.data.user;

        

           setUser (userData);


           setFormData ({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            address: userData.address || "",
            city: userData.city || "",
            postalCode: userData.postalCode || "",
            phone: userData.phone || "",
           });

          }
        } catch (error) {
        
          toast.error (error.response?.data?.message || "Failed to load profile");
        }finally {
          setLoading (false);
        }
      }

      fetchProfile ()
   },[token,backendUrl]);


   //----------------------------------Handle Input------------------------------------

   const handleChange = (e) => {

    const {name, value } = e.target;

    setFormData ((prev) => (
      {
        ...prev,
        [name] : value,
      }
    ));
   };


  //  ----------------------------------UPDATE PROFILE-------------------------------------
 
    const handleSubmit = async (e) => {
      e.preventDefault();

      const form = new FormData();

      form.append ("firstName", formData.firstName);
      form.append ("lastName", formData.lastName);
      form.append ("address", formData.address);
      form.append ("city",formData.city);
      form.append ("postalCode", formData.postalCode);
      form.append ("phone", formData.phone);
      


      if(image) {
        form.append ("file",image);
      }

      try {
        
        const response = await axios.put (`${backendUrl}/api/v1/user/profile`, form,
         
        {

           headers: {
          Authorization: `Bearer ${token}`,
               // Don't need to manually set Content-Type.
                                                         // Axios will set multipart/form-data with the boundary.
        },
      }
    
    );


    if(response.data.success) {
      toast.success (response.data.message);

      const updateUser = response.data.user;

     
      setUser (updateUser);

      setFormData ({
        firstName: updateUser.firstName || '',
        lastName: updateUser.lastName || '',
        email: updateUser.email || '',
        address: updateUser.address || '',
        city: updateUser.city || '',
        postalCode: updateUser.postalCode || '',
        phone: updateUser.phone || '',

      });

       setImage (null);

      setEditing (false);

    }


      
      } catch (error) {
        console.log("Update Profile Error:", error);

        toast.error (error.response?.data?.message || "Failed to update profile")

      }finally {
        setSaving (false)
      }
    }

//  -----------------------------------Loading------------------------------------

if(loading) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-5000">Loading...</p>
    </div>
  )
};


// ---------------------------------User Interface/UI---------------------------------

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      
       {/*------------------------ Heading ---------------------------------------*/}

       <div>
           <h1 className="text-2xl sm:text-3xl font-medium">My Profile</h1>

           <p className="text-gray-500 mt-2">Manage your personal information and account details.</p>
       </div>

       {/* ----------------------------Profile Card--------------------------------- */}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
           <div className="flex flex-col items-center text-center">

            {/* -------------------------------Profile Picture Placeholder----------------------------------- */}
               <div className=" flex flex-col items-center  mb-4">
                 <img src= {user?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Profile" className="w-28 h-28 rounded-full object-cover" />
                 
                 {
                  editing && (
                    
                    
                     <label  className="mt-2 border outline-none border-sky-500 px-3 py-2 text-white rounded-sm bg-pink-500 text-sm cursor-pointer " ><input type="file" accept="image/*" id="Profile-image" onChange={(e) => setImage(e.target.files[0]) } className="mt-3" hidden />

                    
                      Change Profile</label>
              
                   
                    
                  )
                 }
               </div>

               <h2 className="text-xl font-medium">{user?.firstName} {user?.lastName}</h2>

               <p className="text-gray-500 text-sm mt-1">{user?.email}</p>

               <div className="mt-4">
                   <span
                className={`text-xs px-3 py-1 rounded-full ${
                  user?.isVerified
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {user?.isVerified ? "Verified Account" : "Not Verified"}
              </span>
               </div>

               <button onClick={() => setEditing ((prev) => !prev)} className="mt-6 w-full border border-gray-800 py-2 rounded hover:bg-gray-600 hover:text-white transition">
                {editing ? "Cancel Editing" : "Edit Profile"}</button>
           </div>
       </div>

       {/* -----------------------------------------Profile Information-------------------------------- */}

        <div className="lg:col-span-2 border rounded-lg mt-2 p-6 sm:p-8">
            
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Personal Information</h2>

                {!editing && (
                  <button onClick={() => setEditing(true)} className="text-sm underline">Edit</button>
                )}
             </div>

             <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* ----------------------First Name ------------------------ */}

                     <div>
                         <label className="block text-sm text-gray-600 mb-2">First Name</label>

                         <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                          disabled = {!editing} className="w-full border rounded px-3 py-2 outline-none disabled:bg-gray-100 focus:border-sky-500" />
                     </div>

                     {/* -------------------------Last Name------------------------------- */}
                     <div>
                         <label className="block text-sm text-gray-600 mb-2">Last Name</label>

                         <input type="text" name="lastName" value={formData.lastName} 
                         onChange={handleChange} disabled = {!editing} className="w-full border rounded px-3 py-2 outline-none disabled:bg-gray-100 focus:border-sky-500" />
                     </div>

                     {/* ----------------------------- Email --------------------------------*/}
                      <div className="sm:col-span-2">
                           <label className="block text-sm text-gray-600 mb-2">Email</label>

                           <input type="email" name="email" value={formData.email} onChange={handleChange}
                           disabled = {!editing} className="w-full border outline-none rounded px-3 py-2 disabled:bg-gray-100 focus:border-sky-500" />
                     
                         <p className="text-sm text-gray-400 mt-1">Email cannot be changed here.</p>
                      </div>

                     {/* --------------------------City-------------------------------------------------- */}

                     <div>
                         <label className="block text-sm text-gray-600 mb-2">City</label>

                         <input type="text" name="city" value={formData.city} onChange={handleChange}
                         disabled = {!editing} placeholder = "Enter City" className="w-full border rounded px-3 py-2 disabled:bg-gray-100 focus:border-sky-500" />
                      </div>

                    {/* ---------------------------------Address------------------------------------------ */}
                    
                      <div>
                           <label className="block text-sm text-gray-600 mb-2">Address</label>
                            
                            <input type="text" name="address" value={formData.address} placeholder="Enter Address"
                            onChange={handleChange} disabled = {!editing} className="w-full border rounded px-3 py-2 disabled:bg-gray-100 focus:border-sky-500" />
                      </div>
                      


                        {/* -------------------------Postal Code--------------------------------------------------- */}
                    

                    <div>
                        <label className="block text-sm text-gray-600 mb-2">Postal Code</label>
                  
                        <input type="text"  name="postalCode" value={formData.postalCode}
                        onChange={handleChange} disabled = {!editing}  placeholder="Enter postal code" className="w-full border rounded px-3 py-2 disabled:bg-gray-100 focus:border-sky-500"/>
                  
                  
                    </div>

                      {/* -------------------------Phone Number--------------------------------- */}

                    <div>
                        <label className="block text-sm text-gray-600 mb-2">Phone</label>

                        <input type="text" name="phone" value={formData.phone} placeholder="Enter phone number"
                         onChange={handleChange} disabled = {!editing} className="w-full border rounded px-3 py-2 outline-none disabled:bg-gray-100 focus:border-sky-500" />
                    </div>
                </div>

                {/* -------------------------------Save Button------------------------------------------------------- */}

                {editing && (
                   <div className="flex gap-3 mt-8">

                     <button type="submit" disabled = {saving} className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition disabled:opacity-50">
                       {saving ? "Saving..." : "Save Changes"}
                     </button>

                   </div>
                )}
             </form>

        </div>
    </div>
  )
}


export default Profile;



// function Profile() {
//   return (
//     <div>Profile</div>
//   )
// }

// export default Profile;
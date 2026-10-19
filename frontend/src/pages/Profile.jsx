import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {toast} from 'react-toastify'
import axios from 'axios';
import { ShopContext } from "../context/ShopContext";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];




function Profile() {
  
   const {user, setUser} = useContext (ShopContext);

   const backendUrl = import.meta.env.VITE_BACKEND_URL;

   const fileInputRef = useRef (null);
   const submittingRef = useRef (false);

   const token = localStorage.getItem("accessToken")

   const [image, setImage] = useState (null)


   
   const [saving, setSaving] = useState (false);
   const [editing, setEditing] = useState (false);
   const [errors, setErrors] = useState ({});

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
    
    let active = true;
  
    
      const fetchProfile = async () => {

        if (!token) {
          if (active) {
            setLoading (false);
          }
          return;
        }
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
         if (!active) return;

          if (error.response?.status === 401) {
            toast.error ("Your session has expired. Please sign in again.");
          } else {
          toast.error (error.response?.data?.message || "Failed to load profile");

        }
        }finally {
          if (active) {
             setLoading (false);
          }
         
        }
      }

      fetchProfile ()

      return () => {
        active = false;
      }
   },[token,backendUrl,setUser]);


  //  Create and clean up the image preview URL

// useEffect(() => {
//   if (!image) return;

//   const previewUrl = URL.createObjectURL(image);

//   imagePreviewRef.current = previewUrl;
//   setImagePreview(previewUrl);

//   return () => {
//     URL.revokeObjectURL(previewUrl);

//     if (imagePreviewRef.current === previewUrl) {
//       imagePreviewRef.current = "";
//     }
//   };
// }, [image]);

  
  //  ----------------------------------Handle Input------------------------------------


const imagePreview = useMemo(() => {
  if (!image) return "";

  return URL.createObjectURL(image);
}, [image]);

useEffect(() => {
  if (!imagePreview) return;

  return () => {
    URL.revokeObjectURL(imagePreview);
  };
}, [imagePreview]);

   const handleChange = (e) => {

    const {name, value } = e.target;

    setFormData ((prev) => (
      {
        ...prev,
        [name] : value,
      }
    ));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      form: '',
    }))
   };

   // Validate an image before seletecting it

   const handleImageChange  = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error ("Choose a JPG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE) {
      toast.error("Profile image must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    setImage (selectedFile);
    setErrors ((prev) => ({
      ...prev,
      form: "",
    }));
   };
 

   const clearSelectedImage = () => {
    setImage (null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
   };


   // Validate the form before sending the request

   const validateForm = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    } else if (formData.firstName.trim.length > 50) {
      nextErrors.firstName = "First name must be 50 characters or fewer.";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }else if (formData.lastName.trim().length > 50) {
       nextErrors.lastName = "Last name must be 50 characters or fewer."
    }

    const phone = formData.phone.trim();

    if (phone) {
      const phonePattern = /^\+?[0-9\s()-]+$/;

      const digitCount = phone.replace(/\D/g, "").length;

      if (!phonePattern.test(phone) ||
       digitCount < 7 || digitCount > 15) {
        nextErrors.phone = "Enter a valid phone number with 7-15 digits.";
       }
    
    }

    if (image && !ALLOWED_IMAGE_TYPES.includes(image.type)) {
      nextErrors.image = "Choose a JPG, PNG, or WebP image.";
    }

    if (image && image.size > MAX_IMAGE_SIZE) {
      nextErrors.image = "Image must be 5 MB or smaller.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
   }
 

  //  ----------------------------------UPDATE PROFILE-------------------------------------
 
    const handleSubmit = async (e) => {
      e.preventDefault();

      // Protect against repeated submissions

     
      if (submittingRef.current || saving) return;

      if (!token) {
        toast.error ("Please sign in to update your profile.");
        return;
      }

      if (!validateForm()) {
        toast.error ("Pleases correct the highlighted fields.");

        return;
      }

      submittingRef.current = true;

      setSaving(true);

      const form = new FormData();

      form.append ("firstName", formData.firstName.trim());
      form.append ("lastName", formData.lastName.trim());
      form.append ("address", formData.address.trim());
      form.append ("city",formData.city.trim());
      form.append ("postalCode", formData.postalCode.trim());
      form.append ("phone", formData.phone.trim());
      


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

      // Show success notification only once
      toast.success (response.data.message || "Profile updated successfully.");

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

      setErrors({});

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }


    }


      
      } catch (error) {

        if (error.response?.status === 401) {
          toast.error ("Your sessison has expired. Please sign in again.");

        } else if ( error.response?.status === 422) {
          toast.error (error.response?.data?.message || "Plesae check your profile information.") 
        } else {
           console.log("Update Profile Error:", error);
        }
        

        toast.error (error.response?.data?.message || "Failed to update profile")

      }finally {

        submittingRef.current = false;
        setSaving (false)
      }
    };

    // Discard changes and restore the saved profile

    const handleCancel = () => {
      if (saving) return;

      setFormData();
      setImage(null);
      setErrors({});
      setEditing(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

//  -----------------------------------Loading------------------------------------

if(loading) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
        <p role = "status" aria-live="polite" className="text-gray-500">Loading your profile...</p>
    </div>
  )
};


const profileImage = imagePreview || 
      user?.profilePic ||
     "https://cdn-icons-png.flaticon.com/512/149/149071.png";

     const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

 
     const inputClass = (field) => `w-full min-w-0 rounded-lg border px-3 py-2.5 
     text-sm outline-none transition-colors focus:border-gray-900 focus:ring-2 focus:ring-gray-200
     disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-600 
     ${
       errors [field] 
       ? "border-red-500" : "border-gray-200"
     }
     `

// ---------------------------------User Interface/UI---------------------------------

  // return (
  //   <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      
  //      {/*------------------------ Heading ---------------------------------------*/}

  //      <div>
  //          <h1 className="text-2xl sm:text-3xl font-medium">My Profile</h1>

  //          <p className="text-gray-500 mt-2">Manage your personal information and account details.</p>
  //      </div>

  //      {/* ----------------------------Profile Card--------------------------------- */}

  //      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
  //          <div className="flex flex-col items-center text-center">

  //           {/* -------------------------------Profile Picture Placeholder----------------------------------- */}
  //              <div className=" flex flex-col items-center  mb-4">
  //                <img src= {user?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Profile" className="w-28 h-28 rounded-full object-cover" />
                 
  //                {
  //                 editing && (
                    
                    
  //                    <label  className="mt-2 border outline-none border-sky-500 px-3 py-2 text-white rounded-sm bg-pink-500 text-sm cursor-pointer " ><input type="file" accept="image/*" id="Profile-image" onChange={(e) => setImage(e.target.files[0]) } className="mt-3" hidden />

                    
  //                     Change Profile</label>
              
                   
                    
  //                 )
  //                }
  //              </div>

  //              <h2 className="text-xl font-medium">{user?.firstName} {user?.lastName}</h2>

  //              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>

  //              <div className="mt-4">
  //                  <span
  //               className={`text-xs px-3 py-1 rounded-full ${
  //                 user?.isVerified
  //                   ? "bg-green-100 text-green-600"
  //                   : "bg-yellow-100 text-yellow-600"
  //               }`}
  //             >
  //               {user?.isVerified ? "Verified Account" : "Not Verified"}
  //             </span>
  //              </div>

  //              <button onClick={() => setEditing ((prev) => !prev)} className="mt-6 w-full border border-gray-800 py-2 rounded hover:bg-gray-600 hover:text-white transition">
  //               {editing ? "Cancel Editing" : "Edit Profile"}</button>
  //          </div>
  //      </div>

  //      {/* -----------------------------------------Profile Information-------------------------------- */}

  //       <div className="lg:col-span-2 border rounded-lg mt-2 p-6 sm:p-8">
            
  //            <div className="flex items-center justify-between mb-6">
  //               <h2 className="text-xl font-medium">Personal Information</h2>

  //               {!editing && (
  //                 <button onClick={() => setEditing(true)} className="text-sm underline">Edit</button>
  //               )}
  //            </div>

  //            <form onSubmit={handleSubmit}>
  //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
  //                   {/* ----------------------First Name ------------------------ */}

  //                    <div>
  //                        <label className="block text-sm text-gray-600 mb-2">First Name</label>

  //                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
  //                         disabled = {!editing} className="w-full border rounded px-3 py-2 outline-none disabled:bg-gray-100 focus:border-sky-500" />
  //                    </div>

  //                    {/* -------------------------Last Name------------------------------- */}
  //                    <div>
  //                        <label className="block text-sm text-gray-600 mb-2">Last Name</label>

  //                        <input type="text" name="lastName" value={formData.lastName} 
  //                        onChange={handleChange} disabled = {!editing} className="w-full border rounded px-3 py-2 outline-none disabled:bg-gray-100 focus:border-sky-500" />
  //                    </div>

  //                    {/* ----------------------------- Email --------------------------------*/}
  //                     <div className="sm:col-span-2">
  //                          <label className="block text-sm text-gray-600 mb-2">Email</label>

  //                          <input type="email" name="email" value={formData.email} onChange={handleChange}
  //                          disabled className="w-full border outline-none rounded px-3 py-2 disabled:bg-gray-100 focus:border-sky-500" />
                     
  //                        <p className="text-sm text-gray-400 mt-1">Email cannot be changed here.</p>
  //                     </div>

  //                    {/* --------------------------City-------------------------------------------------- */}

  //                    <div>
  //                        <label className="block text-sm text-gray-600 mb-2">City</label>

  //                        <input type="text" name="city" value={formData.city} onChange={handleChange}
  //                        disabled = {!editing} placeholder = "Enter City" className="w-full border rounded px-3 py-2 outline-none disabled:bg-gray-100 focus:border-sky-500" />
  //                     </div>

  //                   {/* ---------------------------------Address------------------------------------------ */}
                    
  //                     <div>
  //                          <label className="block text-sm text-gray-600 mb-2">Address</label>
                            
  //                           <input type="text" name="address" value={formData.address} placeholder="Enter Address"
  //                           onChange={handleChange} disabled = {!editing} className="w-full border rounded px-3 py-2 outline-none disabled:bg-gray-100 focus:border-sky-500" />
  //                     </div>
                      


  //                       {/* -------------------------Postal Code--------------------------------------------------- */}
                    

  //                   <div>
  //                       <label className="block text-sm text-gray-600 mb-2">Postal Code</label>
                  
  //                       <input type="text"  name="postalCode" value={formData.postalCode}
  //                       onChange={handleChange} disabled = {!editing}  placeholder="Enter postal code" className="w-full border rounded px-3 py-2 outline-none disabled:bg-gray-100 focus:border-sky-500"/>
                  
                  
  //                   </div>

  //                     {/* -------------------------Phone Number--------------------------------- */}

  //                   <div>
  //                       <label className="block text-sm text-gray-600 mb-2">Phone</label>

  //                       <input type="text" name="phone" value={formData.phone} placeholder="Enter phone number"
  //                        onChange={handleChange} disabled = {!editing} className="w-full border rounded px-3 py-2 outline-none disabled:bg-gray-100 focus:border-sky-500" />
  //                   </div>
  //               </div>

  //               {/* -------------------------------Save Button------------------------------------------------------- */}

  //               {editing && (
  //                  <div className="flex gap-3 mt-8">

  //                    <button type="submit" disabled = {saving} className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition disabled:opacity-50">
  //                      {saving ? "Saving..." : "Save Changes"}
  //                    </button>

  //                  </div>
  //               )}
  //            </form>

  //       </div>
  //   </div>
  // )

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Page heading */}
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          My Account
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
          Manage your personal information and keep your
          account details up to date.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Profile summary */}
        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={profileImage}
                alt={
                  fullName
                    ? `${fullName}'s profile`
                    : "Profile picture"
                }
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}
                className="h-28 w-28 rounded-full border border-gray-200 bg-gray-50 object-cover sm:h-32 sm:w-32"
              />

              {editing && (
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-900 text-white shadow-sm transition hover:bg-gray-700 focus-within:ring-2 focus-within:ring-gray-500"
                  title="Change profile picture"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
                    />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>

                  <input
                    ref={fileInputRef}
                    id="profile-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={saving}
                    className="sr-only"
                    aria-label="Choose profile picture"
                  />
                </label>
              )}
            </div>

            {editing && image && (
              <button
                type="button"
                onClick={clearSelectedImage}
                disabled={saving}
                className="mt-3 text-xs font-medium text-red-600 underline underline-offset-4 hover:text-red-700 disabled:opacity-50"
              >
                Remove selected image
              </button>
            )}

            {editing && (
              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG or WebP · Max 5 MB
              </p>
            )}

            <h2 className="mt-5 wrap-break-words text-xl font-semibold text-gray-900">
              {fullName || "Your Name"}
            </h2>

            <p className="mt-1 max-w-full break-all text-sm text-gray-500">
              {user?.email || "No email available"}
            </p>

            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                  user?.isVerified
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    user?.isVerified
                      ? "bg-green-500"
                      : "bg-amber-500"
                  }`}
                />
                {user?.isVerified
                  ? "Verified Account"
                  : "Not Verified"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (editing) {
                  handleCancel();
                } else {
                  setEditing(true);
                  setErrors({});
                }
              }}
              disabled={saving}
              className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editing ? "Cancel Editing" : "Edit Profile"}
            </button>
          </div>
        </aside>

        {/* Profile form */}
        <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {editing
                  ? "Update your details below."
                  : "Your saved account information."}
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setErrors({});
                }}
                className="rounded-md px-2 py-1 text-sm font-medium text-gray-800 underline underline-offset-4 hover:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
              >
                Edit details
              </button>
            )}
          </div>

          {errors.form && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {errors.form}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              {/* First name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  First Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  maxLength={50}
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={
                    errors.firstName ? "firstName-error" : undefined
                  }
                  className={inputClass("firstName")}
                />

                {errors.firstName && (
                  <p
                    id="firstName-error"
                    role="alert"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  maxLength={50}
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={
                    errors.lastName ? "lastName-error" : undefined
                  }
                  className={inputClass("lastName")}
                />

                {errors.lastName && (
                  <p
                    id="lastName-error"
                    role="alert"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  disabled
                  className={inputClass("email")}
                />

                <p className="mt-1.5 text-xs text-gray-500">
                  Email changes require a separate verification process.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+966 5X XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={
                    errors.phone ? "phone-error" : undefined
                  }
                  className={inputClass("phone")}
                />

                {errors.phone && (
                  <p
                    id="phone-error"
                    role="alert"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  className={inputClass("city")}
                />
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Street Address
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  className={inputClass("address")}
                />
              </div>

              {/* Postal code */}
              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Postal Code
                </label>

                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  placeholder="Enter postal code"
                  value={formData.postalCode}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  className={inputClass("postalCode")}
                />
              </div>
            </div>

            {/* Form actions */}
            {editing && (
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}

                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}


export default Profile;



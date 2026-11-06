import {useEffect, useState } from "react";
import uploadImg  from "../assets/share.png";
import { toast } from "react-toastify";
import adminAxios from "../utils/AdminAxios";
import { Link } from "react-router-dom";


function Banner() {

  const [image, setImage] = useState (false);

  const [title, setTitle] = useState ("");
  const [subTitle, setSubTitle] = useState ("");
  const [buttonText, setButtonText] = useState ("Shop Now");
  const [link, setLink] = useState ("/collection");
  const [banners, setBanners] = useState ([]);
  const [loading, setLoading] = useState (false);
  const [listLoading, setListLoading] = useState(true);


  const [deletingId, setDeletingId] = useState (null);
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [selectdBannerId, setSelectedBannerId] = useState(null);


  

 // Add Banner

   const addBanner = async (e) => {

    e.preventDefault();

    if (!image) {
      return toast.error ("Please select a banner image");
    }
     
    if (!title.trim () || !subTitle.trim ()) {
      return toast.error("Please enter title and subtitle");
    }

    try {
      
       setLoading(true)

       const formData = new FormData();

       formData.append("title", title);
       formData.append ("subTitle", subTitle);
       formData.append ("buttonText", buttonText);
       formData.append ("link", link);
       formData.append ("file",image);

      const response = await adminAxios.post('/api/v1/banner/add-banner', formData);

      console.log("FormData:", response)

      if (response.data.success) {
        toast.success(response.data.message || "Banner added successfully");


      }else {
        toast.error(response.data.message || "Failed to add banner");
      }


    } catch (error) {
      console.error("Banner faild to add:",error);
      toast.error(error.response?.data?.message || "Failed to add banner");
    }finally{
      setLoading(false)
    }
   }

   // ----------------------Get all Banners for Admin Panel---------------------

   useEffect (() => {
     
       const fetchBanners = async () => {
         try {
           setListLoading(true)
           const response = await adminAxios.get ('/api/v1/banner/list-banner');

           if (response.data.success) {
            setBanners(response.data.banners);
           }
         } catch (error) {
          console.error("Failed to fetch banners:", error);
          toast.error("Failed to load banners");
         }finally{
          setListLoading(false)
         }
       }
     
      
     fetchBanners()
   },[])


   // ---------------------Toggle Activate / Deactivate Banner----------------

   const toggleStatus = async (id) => {
    try {
      const response = await adminAxios.patch(`/api/v1/banner/status/${id}`)

      console.log("ToggleStatus:", response);

      if (response.data.success) {
        setBanners((prevBanner) => 
          prevBanner.map((banner) => 
          banner._id === id ? 
          response.data.banner
          : banner
      )
        )
      }
    } catch (error) {
      console.error("Toggle Status Error:", error);

      toast.error(error.response?.data?.message || "Failed to update banner status")
    }
   }
  

   // -----------------------------Delete Banner-----------------------------

   const removeBanner = async (id) => {

    if (deletingId !== null ) return;

    setSelectedBannerId(id);
    setShowDeleteModel (true)
   }

   const confirmRemoveBanner = async () => {

   if (!selectdBannerId || deletingId !== null) return;

   const id = selectdBannerId;


    try {

      setDeletingId(id);
      const response = await adminAxios.delete (`/api/v1/banner/delete/${id}`);

      if (response.data.message) {
        setBanners((prevBanner) => 
         prevBanner.filter((banner) => banner._id !== id)
        );
        toast.success ("Banner deleted successfully")
      }
    } catch (error) {
      console.error ("Delete Banner Error:", error);
      toast.error (error.response?.data?.message || "Failed to delete banner")
    }finally {
      setDeletingId(null);
      setShowDeleteModel(false);
      setSelectedBannerId(null);
    }
   }



  return (
    <div>
       <h2 className="text-2xl text-gray-500 font-medium">Banner Magangement</h2>
       <form  onSubmit={addBanner}>
              {/* -------------------Add Banner------------------ */}
        <div className="w-full flex flex-col mt-10">
            
             <div className=" w-40 px-2 py-2 border border-gray-300 rounded-md">
               <label className="cursor-pointer">
               <img src= {image ? URL.createObjectURL(image) : uploadImg}
                alt="Banner preview"
                className="w-40 h-24 object-cover"
                />
              
               <input type="file"
                 accept="image/*"
                 onChange={(e) => setImage(e.target.files[0] || false)}
                  hidden
                 />
            </label>
             </div>
            
            

             {/* -------------Title and subTitle-------------- */}
              <div className="mt-8 flex flex-col gap-2">
                  <label htmlFor="title" 
                  className="text-lg text-gray-500 font-semibold">Title</label>

                  <input type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                   id="title"
                   placeholder="Enter banner title"
                   className="w-full sm:max-w-100 py-2 px-2 border outline-none focus:border-sky-500 border-gray-500 rounded-md" /> 

                <label htmlFor="subtitle" className="text-lg text-gray-500 font-semibold">SubTitle</label>
                  <input type="text"
                   value={subTitle}
                   onChange={(e) => setSubTitle(e.target.value)}
                   id="subtitle"
                   placeholder="Enter banner subtitle"
                   className="w-full sm:max-w-100 py-2 px-2 border outline-none focus:border-sky-500 border-gray-500 rounded-md" /> 
           
           
               {/* ------------Button Text--------------- */}

               <label htmlFor="buttonText" className="text-lg text-gray-500 font-semibold">
                  Button Text
               </label>

               <input type="text"
                 id="buttonText"
                 value={buttonText}
                 onChange={(e) => setButtonText(e.target.value)}
                 placeholder="Enter button text"
                 className="w-full sm:max-w-100 py-2 px-2 border border-gray-500 outline-none rounded-md focus:border-sky-500"
                 />

                 <label htmlFor="link" className="text-lg text-gray-500 font-semibold">Link</label>
                 
                 <input type="text"
                   value={link}
                   onChange={(e) => setLink(e.target.value)}
                   placeholder="Enter link"
                   className="w-full sm:max-w-100 py-2 px-2 border border-gray-500 rounded-md outline-none focus:border-sky-500"
                   />
           
           
              </div>

              <button type="submit"
               disabled = {loading}
               className="max-w-40 px-8 py-2 my-5 border border-gray-400 rounded-md bg-black/50 text-white hover:bg-gray-200 hover:text-black transition-all">
                {loading ? "Adding Banner..." : "Add Banner" }</button>
        </div>
       </form>

       {/* -------------------Get Banner List---------------------- */}


       {
        showDeleteModel && ( 
           <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
             <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-gray-800 text-center">
                   Delete Banner
                </h2>
                 
                 <p className="mt-3 text-sm text-gray-600 text-center">Are you sure you want to delete this banner?</p>
                  
                  <div className="mt-6 flex justify-center gap-3">
                     <button type="button"
                      disabled = {deletingId !== null}
                      onClick={() => {setShowDeleteModel (false); setSelectedBannerId (null)}  }
                      className="border border-gray-500 px-4 py-2 text-sm  text-black rounded-md hover:bg-gray-300 disabled:opacity-50"
                      >
                        Cancel
                     </button>

                     <button type="button" 
                      disabled = {deletingId !== null}
                      onClick={confirmRemoveBanner}
                       className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                      
                         {deletingId !== null ? "Deleting..." : "Delete"}
                      </button>
                  </div>
              </div>
          </div>
        )
       }
        <div className="mt-5">
            <h2 className="text-md text-gray-700 font-semibold mb-2">All Banners {" "} - {" "} {banners.length}</h2> 

            {
              listLoading ? (
                <p className="text-gray-500">Loading banners...</p>
              ): banners.length === 0 ? (
                <p className="text-gray-500">No banners found.</p>
              ): (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  
                <div className="overflow-x-auto ">
                   <table className="w-full text-sm">
                     <thead className="bg-gray-50 border-b border-gray-500">
                        <tr>
                            <th className="text-left px-5 py-4 font-medium text-gray-700">Image</th>
                            <th className="text-left px-5 py-4 font-medium text-gray-700">Title</th>
                            <th className="text-left px-5 py-4 font-medium text-gray-700">SubTitle</th>
                            <th className="text-left px-5 py-4 font-medium text-gray-700">Button Text</th>
                            <th className="text-left px-5 py-4 font-medium text-gray-700">Link</th>
                            <th className="text-left px-5 py-4 font-medium text-gray-700">Status</th>
                            <th className="text-left px-5 py-4 font-medium text-gray-700">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                         {
                        banners.map((banner) => (
                          <tr key={banner._id}>
                             <td className="p-2 border border-gray-200">
                                 <img src= {banner.image} alt={banner.title} className="w-24 h-24 object-cover rounded-md" />
                             </td>

                             <td className="p-2 border border-gray-200">
                               <p>{banner.title}</p>
                             </td>

                             <td className="p-2 border border-gray-200">{banner.subTitle}</td>
                              
                              <td className="p-2 border border-gray-200">{banner.buttonText}</td>
                              
                              <td className="p-2 border border-gray-200">{banner.link}</td>

                              <td className="p-2 border border-gray-200">

                                <button 
                                 type="button"
                                 onClick={() => toggleStatus (banner._id)}
                                 className= {`px-3 py-1 rounded-md text-xs font-medium
                                   ${banner.isActive 
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                   }`}
                                >
                                  {banner.isActive ? "Active" : "Inactive"}

                                </button>
                                 
                              </td>

                              <td className=" p-2 border border-gray-200">
                                
                                  <Link
                                       to={`/update-banner/${banner._id}`}
                                       onClick={(e) => {
                                         if (deletingId !== null || showDeleteModel) {
                                           e.preventDefault();
                                         }
                                       }}
                                     >
                                       <p className="text-white w-16 px-3 py-2 ml-2 mb-2 text-sm text-center bg-sky-500 hover:bg-sky-600 rounded-md">
                                         Edit
                                        </p>
                                     </Link>
                            
                                  <button type="button"
                                   onClick={() => removeBanner(banner._id)} 
                                   className="px-3 py-2 ml-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition-all"
                                  >Delete</button>
                              </td>
                          </tr>
                        ))
                      }
                     </tbody>
                      
                   </table>
                  </div>
               </div>
              )
                
              
            }
        </div>
     
    </div>
  )
}

export default Banner;
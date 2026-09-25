import { useEffect, useState } from "react";
import axios from 'axios';
import {toast} from 'react-toastify'
import { Link } from "react-router-dom";

function List() {
  
  const [list, setList] = useState([]);
  const currency = "⃁"

  const fetchList = async () => {

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/product/all-product`
    try {
      const response = await axios.get (url);
       
      if(response.data.success) {
        setList(response.data.products);
        toast.success (response.data.message);
      }else {
        toast.error(response.data.message);
      }
      console.log(response.data);
    } catch (error) {
      console.log(error)
      toast.error (error.response?.data?.message);
    }
  }


  useEffect (() => {
    const getProducts = async () => {
      await fetchList ()
    };
    getProducts ();
  },[]);


  const removeProduct = async (id) => {

    const confirmDelete = window.confirm("Are your sure you want to delete this product?");

    if (!confirmDelete)  return; 
     const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/product/${id}`;
    const token = localStorage.getItem ("adminToken");




    try {
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if(response.data.success) {
        toast.success(response.data.message);
        // Remove product from UI immediately

        setList ((prev) => prev.filter((item) => item._id !== id));
      }else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message);
    }
  }

  return (
    <>
       <h1 className="text-lg md:text-2xl font-semibold">All Products</h1>
      <div className="flex flex-col gap-2">
        {/* ---------- List Table Title -------------- */}
         
         <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 mt-5 border border-slate-800 bg-gray-200 text-sm rounded-sm">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Actions</b>
         </div>

         {/* -----------Product List ------------*/}

         {
          list.map((item,index) => (
            <div className=" w-full pt-3 grid grid-cols-[1fr_3fr_1fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center " key={index} > 
              <img src= {item.productImg?.[0]?.url} alt="" className="w-20 object-fill py-1 px-2 rounded-sm" />
               <p>{item.name}</p>
               <p>{item.category}</p>
               <p> {currency} {item.price} </p>

                <div className="flex gap-2 items-center">
                   <Link to = {`/update-product/${item._id}`} >
                    Edit
                   </Link>
                </div>
               <button onClick ={() => removeProduct(item._id)} className="bg-red-500  text-white px-2 py-1 rounded hover:bg-red-600 transition mt-2 text-xl pl-5 cursor-pointer">Delete</button>
            </div>
          ))
         }
      </div>
        
       
    </>
  )
}

export default List;
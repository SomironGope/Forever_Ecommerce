import { useState } from "react";
import uploadImg from "../assets/share.png";
import axios from "axios";
import { toast } from "react-toastify";





function Add() {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [image5, setImage5] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestSeller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);


  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/product/add-product`

    try {

        const formData = new FormData();

        formData.append ("name", name)
        formData.append ("description", description)
        formData.append ("price", price)
        formData.append ("stock", stock)
        formData.append ("category", category)
        formData.append ("subCategory", subCategory)
        formData.append ("bestSeller", bestSeller)
        formData.append ("sizes",sizes.join(","))


        image1 && formData.append ("file", image1)
        image2 && formData.append ("file", image2)
        image3 && formData.append ("file", image3)
        image4 && formData.append ("file", image4)
        image5 && formData.append ("file", image5)
        

        const token = localStorage.getItem ("adminToken");



        const response = await axios.post (url, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        console.log(response.data)

        if(response.data.success) {
            toast.success(response.data.message)
        }


        console.log(formData)
    } catch (error) {
      toast.error(error.response?.data?.message);
     console.log("Status:", error.response?.status);
     console.log("Backend error:", error.response?.data);
     console.log("Full error:", error);

    }
  }
   
  
  return (
    <form onSubmit={onSubmitHandler}>
      <div>
        <h1 className="text-2xl font-semibold tracking-wider text-gray-600">
          Add Product
        </h1>
        <div className="mt-5 flex gap-4  items-center">
          <label className="py-1 px-1 border border-slate-800 rounded-sm cursor-pointer">
            <img
              className="w-10 md:w-15"
              src={!image1 ? uploadImg : URL.createObjectURL(image1)}
              alt="uploadImg"
            />
            <input
              onChange={(e) => setImage1(e.target.files[0])}
              type="file"
              id="image1"
              alt="uploadImg 1"
              hidden
            />
          </label>
          <label className="py-1 px-2 border border-slate-800 rounded-sm cursor-pointer">
            <img
              className="w-10 md:w-15"
              src={!image2 ? uploadImg : URL.createObjectURL(image2)}
              alt="uploadImg"
            />
            <input
              onChange={(e) => setImage2(e.target.files[0])}
              type="file"
              id="image2"
              hidden
            />
          </label>
          <label className="py-1 px-2 border border-slate-800 rounded-sm cursor-pointer">
            <img
              className="w-10 md:w-15"
              src={!image3 ? uploadImg : URL.createObjectURL(image3)}
              alt="uploadImg"
            />
            <input
              onChange={(e) => setImage3(e.target.files[0])}
              type="file"
              id="image3"
              hidden
            />
          </label>
          <label className="py-1 px-2 border border-slate-800 rounded-sm cursor-pointer">
            <img
              className="w-10 md:w-15"
              src={!image4 ? uploadImg : URL.createObjectURL(image4)}
              alt="uploadImg"
            />
            <input
              onChange={(e) => setImage4(e.target.files[0])}
              type="file"
              id="image4"
              hidden
            />
          </label>
          <label className="py-1 px-2 border border-slate-800 rounded-sm cursor-pointer">
            <img
              className="w-10 md:w-15"
              src={!image5 ? uploadImg : URL.createObjectURL(image5)}
              alt="uploadImg"
            />
            <input
              onChange={(e) => setImage5(e.target.files[0])}
              type="file"
              id="image5"
              hidden
            />
          </label>
        </div>

        <div className="w-full pt-5">
          <p className="text-lg font-semibold tracking-wide ">Product Name</p>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full max-w-125 border focus:border-sky-600 outline-none px-3 py-2 mt-2 rounded-md"
            type="text"
            placeholder="Type here"
            required
          />
        </div>
        <div className="w-full pt-5">
          <p className="text-lg font-semibold tracking-wide ">
            {" "}
            Product Descriptions
          </p>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="w-full max-w-125 border focus:border-sky-600 outline-none mt-2  px-2 py-1 rounded-md"
            rows={3}
            type="text"
            placeholder="Write content here"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 w-full">
          <div className="mt-3">
            <p className="text-lg font-semibold tracking-wide ">
              Product Category
            </p>
            <select
              onChange={(e) => setCategory(e.target.value)}
              className="w-full  px-3 py-2 mt-2  outline-sky-500"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          <div className="mt-3">
            <p className="text-lg font-semibold tracking-wide ">Sub category</p>
            <select
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full  px-3 py-2 mt-2 outline-sky-500"
            >
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winterwear">Winterwear</option>
            </select>
          </div>

          <div className="mt-3">
            <p className="text-lg font-semibold tracking-wide">Product Price</p>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              className="w-full sm:w-30 px-3 py-2 mt-2  outline-sky-500"
              type="Number"
              placeholder="20"
            />
          </div>
        </div>

        <div className=" flex flex-col mt-3">
          <p className="text-lg font-semibold tracking-wide">Product Sizes</p>
          <div className="flex gap-3 rounded-sm pt-4 ">
            <div
              onClick={() =>
                setSizes((prev) =>
                  prev.includes("S")
                    ? prev.filter((item) => item !== "S")
                    : [...prev, "S"],
                )
              }
            >
              <p className={`${sizes.includes("S") ? "bg-pink-400 text-white" : "bg-slate-200"} px-4 py-2 cursor-pointer rounded-sm`}>
                S
              </p>
            </div>
            <div
              onClick={() =>
                setSizes((prev) =>
                  prev.includes("M")
                    ? prev.filter((item) => item !== "M")
                    : [...prev, "M"],
                )
              }
            >
              <p className = {`${ sizes.includes ("M") ? "bg-pink-400 text-white" : "bg-slate-200" }  px-4 py-2 cursor-pointer rounded-sm`}>
                M
              </p>
            </div>
            <div
              onClick={() =>
                setSizes((prev) =>
                  prev.includes("L")
                    ? prev.filter((item) => item !== "L")
                    : [...prev, "L"],
                )
              }
            >
              <p className= {`${sizes.includes ("L") ? "bg-pink-400 text-white" : "bg-slate-200"}  px-4 py-2 cursor-pointer rounded-sm`}>
                L
              </p>
            </div>
            <div
              onClick={() =>
                setSizes((prev) =>
                  prev.includes("XL")
                    ? prev.filter((item) => item !== "XL")
                    : [...prev, "XL"],
                )
              }
            >
              <p className= {`${sizes.includes ("XL") ? "bg-pink-400 text-white" : "bg-slate-200"}  px-4 py-2 cursor-pointer rounded-sm`}>
                XL
              </p>
            </div>
          </div>
               
            <div className="mt-3">
            <p className="text-lg font-semibold tracking-wide">Product Stock</p>
            <input
              onChange={(e) => setStock(e.target.value)}
              value={stock}
              className="w-full sm:w-30 px-3 py-2 mt-2  outline-sky-500"
              type="Number"
              placeholder="0"
            />
          </div>
            
        </div>
      </div>

      <div className="flex mt-3 gap-2">
        <input onChange={() => setBestSeller (prev => !prev)} checked = {bestSeller} type="checkbox" id="bestseller" />
        <label htmlFor="bestseller" className="cursor-pointer">
          Add to bestseller
        </label>
      </div>

      <button
        type="submit"
        className="w-28 py-3 mt-4 bg-black text-md text-white rounded-md cursor-pointer hover:bg-sky-500 hover:text-black transition"
      >
        Add
      </button>
    </form>
  );
}

export default Add;

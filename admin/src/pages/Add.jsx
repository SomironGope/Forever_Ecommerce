import { useState } from "react";
import uploadImg from "../assets/share.png";
import { toast } from "react-toastify";
import adminAxios from "../utils/AdminAxios";

function Add() {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [image5, setImage5] = useState(false);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");

  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  // const [bestSeller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);

  // Handle Size//

  const handleSizeChange = (size) => {
    setSizes((prev) => {
      const exists = prev.find((item) => item.size === size);

      if (exists) {
        return prev.filter((item) => item.size !== size);
      }

      return [
        ...prev,
        {
          size,
          stock: 0,
        },
      ];
    });
  };

  const handleStockChange = (size, stock) => {
    setSizes((prev) =>
      prev.map((item) =>
        item.size === size
          ? {
              ...item,
              stock: Number(stock),
            }
          : item,
      ),
    );
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const images = [image1, image2, image3, image4, image5].filter(Boolean);

      if (images.length === 0) {
        toast.error("Please upload at least one product image.");

        return;
      }

      if (Number(price) <= 0 || price.trim() === "") {
        toast.error("Please enter a valid product price.");
        return;
      }

      if (oldPrice.trim() !== "" && Number(oldPrice) < 0) {
        toast.error("Original price cannot be negative.");

        return;
      }

      if (Number(oldPrice) > 0 && Number(oldPrice) <= Number(price)) {
        toast.error("Original price must be greater than the product price.");
        return;
      }

      if (sizes.length === 0) {
        toast.error("Please select at least one product size.");
        return;
      }

      if (
        sizes.some((item) => !Number.isInteger(item.stock) || item.stock < 0)
      ) {
        toast.error("Stock must be a non-negative whole number.");
        return;
      }

      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("oldPrice", oldPrice);
      formData.append("category", category);
      formData.append("subCategory", subCategory);

      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("file", image1);
      image2 && formData.append("file", image2);
      image3 && formData.append("file", image3);
      image4 && formData.append("file", image4);
      image5 && formData.append("file", image5);

      const response = await adminAxios.post(
        "/api/v1/product/add-product",
        formData,
      );

      if (response.data.success) {
        toast.success(response.data.message);
      }

      console.log(formData);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to add product. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

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
              onChange={(e) => setImage1(e.target.files[0] || false)}
              type="file"
              accept="image/*"
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
              onChange={(e) => setImage2(e.target.files[0] || false)}
              type="file"
              accept="image/*"
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
              onChange={(e) => setImage3(e.target.files[0] || false)}
              type="file"
              accept="image/*"
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
              onChange={(e) => setImage4(e.target.files[0] || false)}
              type="file"
              accept="image/*"
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
              onChange={(e) => setImage5(e.target.files[0] || false)}
              type="file"
              accept="image/*"
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
              type="number"
              min="0"
              step="0.01"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
              placeholder="20"
              className="w-full sm:w-30 px-3 py-2 mt-2  outline-sky-500"
            />
          </div>

          <div className="mt-3">
            <p className="text-lg font-semibold tracking-wide">
              Original Price
            </p>
            <input
              type="number"
              min="0"
              step="0.01"
              onChange={(e) => setOldPrice(e.target.value)}
              value={oldPrice}
              required
              placeholder="20"
              className="w-full sm:w-30 px-3 py-2 mt-2  outline-sky-500"
            />
          </div>
        </div>
        <div className="flex flex-col mt-3">
          <p className="text-lg font-semibold tracking-wide">
            Product Sizes & Stock
          </p>

          <div className="flex flex-row gap-3 mt-4">
            {["S", "M", "L", "XL", "XXL"].map((size) => {
              const selectedSize = sizes.find((item) => item.size === size);

              return (
                <div key={size} className="flex items-center gap-4">
                  {/* ----Size button---- */}

                  <button
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    className={`w-16 py-2 rounded-sm cursor-pointer ${selectedSize ? "bg-pink-400 text-white" : "bg-slate-200"}`}
                  >
                    {size}
                  </button>

                  {/* ---------------Stock Input------------ */}
                  {selectedSize && (
                    <input
                      type="number"
                      min="0"
                      value={selectedSize.stock}
                      onChange={(e) => handleStockChange(size, e.target.value)}
                      className="w-28 px-3 py-2 border outline-sky-500 rounded-sm"
                      placeholder="Stock"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-28 py-3 mt-4 bg-black text-md text-white rounded-md cursor-pointer hover:bg-sky-500 hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}

export default Add;

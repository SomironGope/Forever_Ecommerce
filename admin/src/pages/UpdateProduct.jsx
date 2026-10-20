import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";
import adminAxios from "../utils/AdminAxios";

function UpdateProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [imageLoading, setImageLoading] = useState(false);

  const [product, setProduct] = useState(null);

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("Men");

  const [subCategory, setSubCategory] = useState("Topwear");

  const [price, setPrice] = useState("");

  const [oldPrice, setOldPrice] = useState("");

  const [sizes, setSize] = useState([
    { size: "S", stock: 0 },
    { size: "M", stock: 0 },
    { size: "L", stock: 0 },
    { size: "XL", stock: 0 },
    { size: "XXL", stock: 0 },
  ]);

  const [isFeatured, setIsFeatured] = useState(false);

  // const [images, setImages] = useState([]);
  // const [previewImages, setPreviewIamges] = useState([]);

  const [selectedImages, setSelectedImages] = useState([]);

  // ---------------------------------Get Product--------------------------

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await adminAxios.get(`/api/v1/product/${productId}`);

        if (response.data.success) {
          const data = response.data.product;

          setProduct(data);

          setName(data.name || "");
          setDescription(data.description || "");

          setCategory(data.category || "Men");

          setSubCategory(data.subCategory || "Topwear");

          setOldPrice(data.oldPrice ?? "");

          setPrice(data.price ?? "");

          setSize(
            data.sizes && data.sizes.length > 0
              ? data.sizes
              : [
                  {
                    size: "S",
                    stock: 0,
                  },
                  {
                    size: "M",
                    stock: 0,
                  },
                  {
                    size: "L",
                    stock: 0,
                  },
                  {
                    size: "XL",
                    stock: 0,
                  },
                  {
                    size: "XXL",
                    stock: 0,
                  },
                ],
          );

          setIsFeatured(data.isFeatured || false);
        }
      } catch (error) {
        console.error("Fetch product error:", error);

        toast.error(error.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // ---------------------Size / Stock----------------------------------

  const handleSizeChange = (index, field, value) => {
    const updateSizes = [...sizes];

    updateSizes[index][field] = field === "stock" ? Number(value) : value;

    setSize(updateSizes);
  };

  // Add Sizes//

  const addSizes = () => {
    setSize([
      ...sizes,
      {
        size: "",
        stock: 0,
      },
    ]);
  };

  const removeSize = (index) => {
    const updateSizes = sizes.filter((_, i) => i !== index);

    setSize(updateSizes);
  };

  // --------------------Image Select------------------------

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const remainingSlots = 5 - selectedImages.length;

    if (remainingSlots <= 0) {
      toast.error("You can upload a maximun of 5 images");
      return;
    }

    const acceptedFiles = selectedFiles.slice(0, remainingSlots);

    if (acceptedFiles.length < selectedFiles.length) {
      toast.warning(`Only ${remainingSlots} more image(s) can be selected`);
    }

    const newImages = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const removePrivewImage = (index) => {
    setSelectedImages((prev) => {
      const imageToRemove = prev[index];

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  //  const removePreviewImage = (index) => {

  //   // Remove selected file

  //   setImages ((prevImages) => prevImages.filter((_,i) => i !== index));

  //   // Remove preview

  //   setPreviewIamges((prePreviews) => {
  //     // Release the object URL

  //     URL.revokeObjectURL(prePreviews[index]);

  //     return prePreviews.filter((_, i) => i !== index);
  //   });
  //  };
  // ------------------------Update Information-----------------------

  const handleUpdateProduct = async (event) => {
    event.preventDefault();
    try {
      setUpdating(true);

      const response = await adminAxios.put(`/api/v1/product/${productId}`, {
        name,
        description,
        category,
        subCategory,
        oldPrice: Number(oldPrice),
        price: Number(price),
        sizes,
        isFeatured,
      });

      if (response.data.success) {
        setProduct(response.data.product);
        toast.success("Product information updated successfully");
      }
    } catch (error) {
      console.error("Update product error:", error);

      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setUpdating(false);
    }
  };

  // --------------------Update Product Image-----------------------------------------

  const handleUpdateImages = async () => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    try {
      setImageLoading(true);

      const formData = new FormData();

      selectedImages.forEach(({ file }) => {
        formData.append("file", file);
      });

      const response = await adminAxios.put(
        `/api/v1/product/${productId}/images`,
        formData,
      );

      if (response.data.success) {
        selectedImages.forEach(({ preview }) => {
          URL.revokeObjectURL(preview);
        });

        setProduct(response.data.product);
        setSelectedImages([]);

        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Update image error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update product images",
      );
    } finally {
      setImageLoading(false);
    }
  };

  // --------------------Loading-------------------------

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <p>Loading Product...</p>
      </div>
    );
  }

  // ------------------------------User Interface----------------------

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Update Product</h1>

        <button
          onClick={() => navigate("/products")}
          className="border px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      {/* ------------------Product Information--------------------------- */}

      <form
        onSubmit={handleUpdateProduct}
        className="bg-white borderr rounded-lg p-6 mb-8"
      >
        <h2 className="text-xl font-medium mb-5">Product Information</h2>

        {/* -----Name---- */}
        <div className="mb-4">
          <label className="block mb-2">Product Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
            required
          />
        </div>

        {/* -----Description----- */}

        <div className="mb-4">
          <label className="block mb-2">Description</label>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
            required
          />
        </div>

        {/* -----Category----- */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
            >
              <option value="Men"> Men</option>
              <option value="Women"> Women</option>
              <option value="Kids"> Kids</option>
            </select>
          </div>

          {/* -----Sub Category---- */}

          <div>
            <label className="block mb-2">Sub Category</label>

            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
              required
            >
              <option value="Topwear">Towear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winter">Winter</option>
            </select>
          </div>
        </div>

        {/* -----Old Price----- */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">Old Price</label>
            <input
              type="number"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
              min="0"
            />
          </div>

          {/* ----Price----- */}

          <div>
            <label className="block mb-2">Current Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
              min="0"
            />
          </div>
        </div>

        {/* -----Sizes---- */}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Sizes & Stock</h3>

            <button
              type="button"
              onClick={addSizes}
              className="border px-3 py-1 rounded hover:bg-sky-400  hover:text-white cursor-pointer transition-all ease-in-out duration-200"
            >
              {" "}
              + Add Size{" "}
            </button>
          </div>

          <div className="space-y-3">
            {sizes.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={item.size}
                  placeholder="Size"
                  onChange={(e) =>
                    handleSizeChange(index, "size", e.target.value)
                  }
                  className="border rounded px-3 py-2 w-32 outline-none focus:border-sky-500"
                />

                <input
                  type="number"
                  value={item.stock}
                  placeholder="Stock"
                  onChange={(e) =>
                    handleSizeChange(index, "stock", e.target.value)
                  }
                  className="border rounded px-3 py-2 w-32 outline-none focus:border-sky-500"
                />

                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="border px-3 py-2 rounded cursor-pointer hover:bg-black hover:text-white transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------Featured-------------- */}

        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4"
          />

          <label>Featured Product</label>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="bg-black text-white px-6 py-3 rounded"
        >
          {updating ? "Updating... " : "Update Product"}
        </button>
      </form>

      {/* --------------------Product Images----------------------------- */}

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-medium mb-5">Product Images</h2>

        {/* -------------Current Images--------------- */}

        {product?.productImg?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3">Current Images</h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {product?.productImg.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded border"
                />
              ))}
            </div>
          </div>
        )}

        {/* --------------Select New Images------------------ */}

        <div>
          <label className="block mb-2 font-medium">Select New Images</label>

          <input
            type="file"
            name="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="cursor-pointer"
          />

          <p className="text-sm text-gray-500 mt-2">
            Select up to images. Updating images will replace the existing
            product images.
          </p>
        </div>

        {/* ---------------Preview Image-------------------------- */}

        {selectedImages.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3">New Images Preview</h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {selectedImages.map((image, index) => (
                <div key={image.preview} className="relative">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />

                  <button
                    type="button"
                    onClick={() => removePrivewImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white border px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleUpdateImages}
          disabled={imageLoading || selectedImages.length === 0}
          className="bg-black text-white px-6 py-3 mt-3 rounded disabled:opacity-50"
        >
          {imageLoading ? "Upading Images..." : "Update Images"}
        </button>
      </div>
    </div>
  );
}

export default UpdateProduct;

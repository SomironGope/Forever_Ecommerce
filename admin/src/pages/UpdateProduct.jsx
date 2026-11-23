
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import adminAxios from "../utils/AdminAxios";

const defaultSizes = [
  { size: "S", stock: 0 },
  { size: "M", stock: 0 },
  { size: "L", stock: 0 },
  { size: "XL", stock: 0 },
  { size: "XXL", stock: 0 },
];

function UpdateProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [product, setProduct] = useState(null);

  // Product information
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [mediumDescription, setMediumDescription] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [sizes, setSizes] = useState(defaultSizes);
  const [isFeatured, setIsFeatured] = useState(false);

  // Additional product information
  const [features, setFeatures] = useState("");
  const [specifications, setSpecifications] = useState([]);
  const [careInstructions, setCareInstructions] = useState("");

  // Variant image management
  const [selectedImages, setSelectedImages] = useState({});
  const [imageLoading, setImageLoading] = useState(null);
  const [deletingImage, setDeletingImage] = useState(null);

  // --------------------------------------------------
  // Fetch Product
  // --------------------------------------------------

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await adminAxios.get(
          `/api/v1/product/${productId}`
        );

        if (!response.data.success) {
          toast.error(response.data.message || "Failed to load product");
          return;
        }

        const data = response.data.product;

        setProduct(data);

        setName(data.name || "");
        setShortDescription(data.shortDescription || "");
        setMediumDescription(data.mediumDescription || "");
        setDescription(data.description || "");

        setCategory(data.category || "Men");
        setSubCategory(data.subCategory || "Topwear");

        setPrice(data.price ?? "");
        setOldPrice(data.oldPrice ?? "");

        setSizes(
          data.sizes?.length > 0
            ? data.sizes.map((item) => ({ ...item }))
            : defaultSizes.map((item) => ({ ...item }))
        );

        setIsFeatured(data.isFeatured || false);

        setFeatures(
          Array.isArray(data.features)
            ? data.features.join("\n")
            : ""
        );

        setSpecifications(
          Array.isArray(data.specifications)
            ? data.specifications.map((item) => ({
                name: item.name || "",
                value: item.value || "",
              }))
            : []
        );

        setCareInstructions(data.careInstructions || "");
      } catch (error) {
        console.error("Fetch product error:", error);
        toast.error(
          error.response?.data?.message || "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // --------------------------------------------------
  // Sizes and Stock
  // --------------------------------------------------

  const handleSizeChange = (index, field, value) => {
    setSizes((previous) =>
      previous.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "stock" ? Number(value) : value,
            }
          : item
      )
    );
  };

  const addSize = () => {
    setSizes((previous) => [
      ...previous,
      { size: "", stock: 0 },
    ]);
  };

  const removeSize = (index) => {
    setSizes((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // --------------------------------------------------
  // Specifications
  // --------------------------------------------------

  const addSpecification = () => {
    setSpecifications((previous) => [
      ...previous,
      { name: "", value: "" },
    ]);
  };

  const handleSpecificationChange = (index, field, value) => {
    setSpecifications((previous) =>
      previous.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const removeSpecification = (index) => {
    setSpecifications((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // --------------------------------------------------
  // Update Product Information
  // --------------------------------------------------

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const formattedFeatures = features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    const formattedSpecifications = specifications
      .map((item) => ({
        name: item.name.trim(),
        value: item.value.trim(),
      }))
      .filter((item) => item.name && item.value);

    try {
      setUpdating(true);

      const response = await adminAxios.put(
        `/api/v1/product/${productId}`,
        {
          name: name.trim(),
          shortDescription: shortDescription.trim(),
          mediumDescription: mediumDescription.trim(),
          description: description.trim(),
          category,
          subCategory,
          price: Number(price),
          oldPrice: Number(oldPrice),
          sizes,
          isFeatured,
          features: formattedFeatures,
          specifications: formattedSpecifications,
          careInstructions: careInstructions.trim(),
        }
      );

      if (response.data.success) {
        if (response.data.product) {
          setProduct(response.data.product);
        }

        toast.success(
          response.data.message || "Product updated successfully"
        );
      }
    } catch (error) {
      console.error("Update product error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update product"
      );
    } finally {
      setUpdating(false);
    }
  };

  // --------------------------------------------------
  // Select Images for a Specific Color Variant
  // --------------------------------------------------

  const handleImageSelection = (event, variant) => {
    const files = Array.from(event.target.files || []);

    event.target.value = "";

    if (files.length === 0) return;

    const currentImageCount = variant.images?.length || 0;
    const pendingImages = selectedImages[variant._id] || [];

    const remainingSlots =
      5 - currentImageCount - pendingImages.length;

    if (remainingSlots <= 0) {
      toast.error("This color already has 5 images");
      return;
    }

    const acceptedFiles = files
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots);

    if (acceptedFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    if (acceptedFiles.length < files.length) {
      toast.warning(
        `You can select only ${remainingSlots} more image(s)`
      );
    }

    const newImages = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages((previous) => ({
      ...previous,
      [variant._id]: [
        ...(previous[variant._id] || []),
        ...newImages,
      ],
    }));
  };

  // --------------------------------------------------
  // Remove Selected Image Preview
  // --------------------------------------------------

  const removePreviewImage = (variantId, index) => {
    setSelectedImages((previous) => {
      const currentImages = previous[variantId] || [];
      const imageToRemove = currentImages[index];

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return {
        ...previous,
        [variantId]: currentImages.filter(
          (_, i) => i !== index
        ),
      };
    });
  };

  // --------------------------------------------------
  // Add Images to Selected Color Variant
  // --------------------------------------------------

  const handleAddImages = async (variant) => {
    const imagesToUpload = selectedImages[variant._id] || [];

    if (imagesToUpload.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    try {
      setImageLoading(variant._id);

      const formData = new FormData();

      imagesToUpload.forEach(({ file }) => {
        formData.append("file", file);
      });

      const response = await adminAxios.post(
        `/api/v1/product/${productId}/variants/${variant._id}/images`,
        formData
      );

      if (response.data.success) {
        imagesToUpload.forEach(({ preview }) => {
          URL.revokeObjectURL(preview);
        });

        setProduct(response.data.product);

        setSelectedImages((previous) => ({
          ...previous,
          [variant._id]: [],
        }));

        toast.success(
          response.data.message || "Images added successfully"
        );
      }
    } catch (error) {
      console.error("Add images error:", error);

      toast.error(
        error.response?.data?.message || "Failed to add images"
      );
    } finally {
      setImageLoading(null);
    }
  };

  // --------------------------------------------------
  // Delete Individual Image from Color Variant
  // --------------------------------------------------

  const handleDeleteImage = async (variant, image) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    const deleteKey = `${variant._id}-${image.public_id}`;

    try {
      setDeletingImage(deleteKey);

      const response = await adminAxios.delete(
        `/api/v1/product/${productId}/variants/${variant._id}/images`,
        {
          data: {
            public_id: image.public_id,
          },
        }
      );

      if (response.data.success) {
        setProduct(response.data.product);

        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Delete image error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete image"
      );
    } finally {
      setDeletingImage(null);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <p>Loading Product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Product not found.</p>

        <button
          type="button"
          onClick={() => navigate("/products")}
          className="border px-4 py-2 rounded"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // User Interface
  // --------------------------------------------------

  return (
    <div className="w-full max-w-5xl mx-auto p-6">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          Update Product
        </h1>

        <button
          type="button"
          onClick={() => navigate("/products")}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          Back
        </button>
      </div>

      {/* ==============================================
          PRODUCT INFORMATION
      ============================================== */}

      <form
        onSubmit={handleUpdateProduct}
        className="bg-white border rounded-lg p-6 mb-8"
      >
        <h2 className="text-xl font-medium mb-5">
          Product Information
        </h2>

        {/* Product Name */}

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

        {/* Short Description */}

        <div className="mb-4">
          <label className="block mb-2">
            Short Description
          </label>

          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
            required
          />
        </div>

        {/* Medium Description */}

        <div className="mb-4">
          <label className="block mb-2">
            Medium Description
          </label>

          <textarea
            value={mediumDescription}
            onChange={(e) => setMediumDescription(e.target.value)}
            rows={3}
            className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
          />
        </div>

        {/* Full Description */}

        <div className="mb-4">
          <label className="block mb-2">
            Full Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
            required
          />
        </div>

        {/* Category and Subcategory */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Sub Category</label>

            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winter">Winter</option>
            </select>
          </div>
        </div>

        {/* Prices */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">Old Price</label>

            <input
              type="number"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              min="0"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Current Price</label>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        {/* Sizes and Stock */}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Sizes & Stock</h3>

            <button
              type="button"
              onClick={addSize}
              className="border px-3 py-2 rounded hover:bg-sky-400 hover:text-white"
            >
              + Add Size
            </button>
          </div>

          <div className="space-y-3">
            {sizes.map((item, index) => (
              <div
                key={index}
                className="flex flex-wrap gap-3 items-center"
              >
                <input
                  type="text"
                  value={item.size}
                  placeholder="Size"
                  onChange={(e) =>
                    handleSizeChange(index, "size", e.target.value)
                  }
                  className="border rounded px-3 py-2 w-32"
                />

                <input
                  type="number"
                  min="0"
                  value={item.stock}
                  placeholder="Stock"
                  onChange={(e) =>
                    handleSizeChange(index, "stock", e.target.value)
                  }
                  className="border rounded px-3 py-2 w-32"
                />

                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="border px-3 py-2 rounded hover:bg-black hover:text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}

        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Product Features
          </label>

          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            rows={5}
            placeholder={"Premium quality fabric\nComfortable fit\nDurable material"}
            className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
          />

          <p className="text-sm text-gray-500 mt-1">
            Enter one feature per line.
          </p>
        </div>

        {/* Specifications */}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">
              Product Specifications
            </h3>

            <button
              type="button"
              onClick={addSpecification}
              className="border px-3 py-2 rounded hover:bg-sky-400 hover:text-white"
            >
              + Add Specification
            </button>
          </div>

          <div className="space-y-3">
            {specifications.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3"
              >
                <input
                  type="text"
                  value={item.name}
                  placeholder="Specification name"
                  onChange={(e) =>
                    handleSpecificationChange(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                  className="border rounded px-3 py-2"
                />

                <input
                  type="text"
                  value={item.value}
                  placeholder="Specification value"
                  onChange={(e) =>
                    handleSpecificationChange(
                      index,
                      "value",
                      e.target.value
                    )
                  }
                  className="border rounded px-3 py-2"
                />

                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="border px-3 py-2 rounded hover:bg-red-500 hover:text-white"
                >
                  Remove
                </button>
              </div>
            ))}

            {specifications.length === 0 && (
              <p className="text-sm text-gray-500">
                No specifications added yet.
              </p>
            )}
          </div>
        </div>

        {/* Care Instructions */}

        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Care Instructions
          </label>

          <textarea
            value={careInstructions}
            onChange={(e) => setCareInstructions(e.target.value)}
            rows={4}
            placeholder="Enter product care instructions..."
            className="w-full border rounded px-3 py-2 outline-none focus:border-sky-500"
          />
        </div>

        {/* Featured Product */}

        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4"
          />

          <label>Featured Product</label>
        </div>

        {/* Update Button */}

        <button
          type="submit"
          disabled={updating}
          className="bg-black text-white px-6 py-3 rounded disabled:opacity-50"
        >
          {updating ? "Updating..." : "Update Product"}
        </button>
      </form>

      {/* ==============================================
          PRODUCT VARIANT IMAGES
      ============================================== */}

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-medium mb-2">
          Product Images
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Manage images separately for each product color.
          Each color can have a maximum of 5 images.
        </p>

        {product.variants?.length > 0 ? (
          <div className="space-y-8">
            {product.variants.map((variant) => {
              const variantImages = variant.images || [];
              const previews = selectedImages[variant._id] || [];

              const remainingSlots =
                5 - variantImages.length - previews.length;

              return (
                <div
                  key={variant._id}
                  className="border rounded-lg p-4"
                >
                  {/* Color Heading */}

                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="w-6 h-6 rounded-full border"
                      style={{
                        backgroundColor: variant.color?.hex || "#ffffff",
                      }}
                    />

                    <h3 className="font-semibold">
                      {variant.color?.name || "Unnamed Color"}
                    </h3>

                    <span className="text-sm text-gray-500">
                      ({variantImages.length}/5 images)
                    </span>
                  </div>

                  {/* Existing Images */}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-5">
                    {variantImages.map((image) => {
                      const deleteKey =
                        `${variant._id}-${image.public_id}`;

                      return (
                        <div
                          key={image.public_id}
                          className="relative"
                        >
                          <img
                            src={image.url}
                            alt={`${variant.color?.name} product`}
                            className="w-full h-32 object-cover rounded border"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteImage(variant, image)
                            }
                            disabled={deletingImage === deleteKey}
                            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                          >
                            {deletingImage === deleteKey
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {variantImages.length === 0 && (
                    <p className="text-sm text-gray-500 mb-4">
                      No images available for this color.
                    </p>
                  )}

                  {/* New Image Previews */}

                  {previews.length > 0 && (
                    <div className="mb-5">
                      <h4 className="font-medium mb-3">
                        New Image Previews
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {previews.map((image, index) => (
                          <div
                            key={image.preview}
                            className="relative"
                          >
                            <img
                              src={image.preview}
                              alt={`New preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded border"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removePreviewImage(
                                  variant._id,
                                  index
                                )
                              }
                              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Images */}

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="border rounded px-4 py-2 cursor-pointer hover:bg-gray-100">
                      Select Images

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={remainingSlots <= 0}
                        onChange={(e) =>
                          handleImageSelection(e, variant)
                        }
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleAddImages(variant)}
                      disabled={
                        imageLoading === variant._id ||
                        previews.length === 0
                      }
                      className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      {imageLoading === variant._id
                        ? "Uploading..."
                        : "Add Images"}
                    </button>

                    <span className="text-sm text-gray-500">
                      {remainingSlots} image slot(s) remaining
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">
            This product does not have any color variants.
          </p>
        )}
      </div>
    </div>
  );
}

export default UpdateProduct;

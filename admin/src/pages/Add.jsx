
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import adminAxios from "../utils/AdminAxios";

function Add() {

  const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"];

const MAX_IMAGES_PER_COLOR = 5;
const MAX_TOTAL_IMAGES = 25;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;


  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [mediumDescription, setMediumDescription] = useState("");
  const [description, setDescription] = useState("");

  // -----------------Category and pricing------------------
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");

  // -----------------Color variants----------------------
  const [variants, setVariants] = useState([]);
  const [imagePreviews, setImagePreviews] = useState({});
  const previewUrlsRef = useRef(new Set());

  const createPreviewUrl = (file) => {
    const url = URL.createObjectURL(file);
    previewUrlsRef.current.add(url);
    return url;
  };

  const revokePreviewUrl = (url) => {
    if (!url) return;

    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  };

  // ----------------New color input-----------------
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");

  // ----------------------Features-------------------
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");

  // ------------------Specifications----------------
  const [specifications, setSpecifications] = useState([]);
  const [specName, setSpecName] = useState("");
  const [specValue, setSpecValue] = useState("");

  // --------------Additional information-------------
  const [careInstructions, setCareInstructions] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [formKey, setFormKey] = useState(0);

  // ----Clean up all image preview URLs when the component unmounts.--------
  useEffect(() => {
    // Keep a stable reference for the cleanup function.
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      previewUrls.clear();
    };
  }, []);

  // ---------------Total uploaded images--------------
  const totalImages = variants.reduce(
    (total, variant) => total + variant.images.length,
    0
  );

  // ---------------------Add color---------------------
  const handleAddColor = () => {
    const trimmedName = colorName.trim();

    if (!trimmedName) {
      toast.error("Please enter a color name.");
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(colorHex)) {
      toast.error("Please select a valid HEX color.");
      return;
    }

    const exists = variants.some(
      (variant) =>
        variant.color.name.toLowerCase() ===
        trimmedName.toLowerCase()
    );

    if (exists) {
      toast.error("This color has already been added.");
      return;
    }

    setVariants((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        color: {
          name: trimmedName,
          hex: colorHex.toUpperCase(),
        },
        images: [],
        sizes: [],
      },
    ]);

    setColorName("");
    setColorHex("#000000");
  };

  // -----------------Remove color--------------------
  const handleRemoveColor = (colorId) => {
    (imagePreviews[colorId] || []).forEach(revokePreviewUrl);

    setImagePreviews((prev) => {
      const updated = { ...prev };
      delete updated[colorId];
      return updated;
    });

    setVariants((prev) =>
      prev.filter((variant) => variant.id !== colorId)
    );
  };

  // ----------Upload images for a specific color---------
  const handleVariantImagesChange = (colorId, files) => {
    const variant = variants.find(
      (item) => item.id === colorId
    );

    if (!variant) return;

    const remainingForColor =
      MAX_IMAGES_PER_COLOR - variant.images.length;

    const remainingTotal =
      MAX_TOTAL_IMAGES - totalImages;

    const availableSlots = Math.min(
      remainingForColor,
      remainingTotal
    );

    if (availableSlots <= 0) {
      toast.error(
        remainingForColor <= 0
          ? "Maximum 5 images allowed per color."
          : "Maximum 25 images allowed per product."
      );
      return;
    }

    const selectedFiles = Array.from(files);
    const validFiles = [];

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image.`);
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds the 5 MB limit.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > availableSlots) {
      toast.warning(
        `You can upload only ${availableSlots} more image(s).`
      );
    }

    const filesToAdd = validFiles.slice(0, availableSlots);

    if (filesToAdd.length === 0) return;

    // Create preview URLs when files are selected, not inside an effect.
    const newPreviewUrls = filesToAdd.map(createPreviewUrl);

    setImagePreviews((prev) => ({
      ...prev,
      [colorId]: [...(prev[colorId] || []), ...newPreviewUrls],
    }));

    setVariants((prev) =>
      prev.map((item) =>
        item.id === colorId
          ? {
              ...item,
              images: [...item.images, ...filesToAdd],
            }
          : item
      )
    );
  };

  //--------- Remove an individual color image-----------
  const handleRemoveVariantImage = (colorId, imageIndex) => {
    const previewUrl = imagePreviews[colorId]?.[imageIndex];
    revokePreviewUrl(previewUrl);

    setImagePreviews((prev) => ({
      ...prev,
      [colorId]: (prev[colorId] || []).filter(
        (_, index) => index !== imageIndex
      ),
    }));

    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === colorId
          ? {
              ...variant,
              images: variant.images.filter(
                (_, index) => index !== imageIndex
              ),
            }
          : variant
      )
    );
  };

  // -----Add or remove a size for a specific color-------
  const handleSizeChange = (colorId, size) => {
    setVariants((prev) =>
      prev.map((variant) => {
        if (variant.id !== colorId) return variant;

        const exists = variant.sizes.some(
          (item) => item.size === size
        );

        return {
          ...variant,
          sizes: exists
            ? variant.sizes.filter(
                (item) => item.size !== size
              )
            : [...variant.sizes, { size, stock: 0 }],
        };
      })
    );
  };

  // -------Update stock for a specific color and size------
  const handleStockChange = (colorId, size, stock) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.id === colorId
          ? {
              ...variant,
              sizes: variant.sizes.map((item) =>
                item.size === size
                  ? {
                      ...item,
                      stock:
                        stock === "" ? "" : Number(stock),
                    }
                  : item
              ),
            }
          : variant
      )
    );
  };

  // -----------------------Add feature---------------------
  const handleAddFeature = () => {
    const value = featureInput.trim();

    if (!value) {
      toast.error("Please enter a product feature.");
      return;
    }

    if (
      features.some(
        (feature) =>
          feature.toLowerCase() === value.toLowerCase()
      )
    ) {
      toast.error("This feature already exists.");
      return;
    }

    setFeatures((prev) => [...prev, value]);
    setFeatureInput("");
  };

  // Remove feature
  const handleRemoveFeature = (index) => {
    setFeatures((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // -------------------Add specification-------------------
  const handleAddSpecification = () => {
    const trimmedName = specName.trim();
    const trimmedValue = specValue.trim();

    if (!trimmedName || !trimmedValue) {
      toast.error(
        "Please enter both specification name and value."
      );
      return;
    }

    if (
      specifications.some(
        (item) =>
          item.name.toLowerCase() ===
          trimmedName.toLowerCase()
      )
    ) {
      toast.error("This specification already exists.");
      return;
    }

    setSpecifications((prev) => [
      ...prev,
      {
        name: trimmedName,
        value: trimmedValue,
      },
    ]);

    setSpecName("");
    setSpecValue("");
  };

  // ------------------Remove specification------------------
  const handleRemoveSpecification = (index) => {
    setSpecifications((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // --------------------Reset form-------------------------
  const resetForm = () => {
    previewUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    previewUrlsRef.current.clear();
    setImagePreviews({});

    setName("");
    setShortDescription("");
    setMediumDescription("");
    setDescription("");

    setCategory("Men");
    setSubCategory("Topwear");

    setPrice("");
    setOldPrice("");

    setVariants([]);
    setColorName("");
    setColorHex("#000000");

    setFeatures([]);
    setFeatureInput("");

    setSpecifications([]);
    setSpecName("");
    setSpecValue("");

    setCareInstructions("");
    setIsFeatured(false);

    setFormKey((prev) => prev + 1);
  };

  // -------------Validate and submit product---------------
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Product information validation
    if (!name.trim()) {
      toast.error("Please enter a product name.");
      return;
    }

    if (
      !shortDescription.trim() ||
      !mediumDescription.trim() ||
      !description.trim()
    ) {
      toast.error("Please complete all product descriptions.");
      return;
    }

    // Price validation
    const productPrice = Number(price);
    const originalPrice =
      oldPrice.trim() === "" ? 0 : Number(oldPrice);

    if (
      !price.trim() ||
      !Number.isFinite(productPrice) ||
      productPrice <= 0
    ) {
      toast.error("Please enter a valid product price.");
      return;
    }

    if (
      !Number.isFinite(originalPrice) ||
      originalPrice < 0
    ) {
      toast.error("Original price cannot be negative.");
      return;
    }

    if (
      originalPrice > 0 &&
      originalPrice <= productPrice
    ) {
      toast.error(
        "Original price must be greater than product price."
      );
      return;
    }

    // Variant validation
    if (variants.length === 0) {
      toast.error("Please add at least one product color.");
      return;
    }

    if (totalImages === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }

    if (totalImages > MAX_TOTAL_IMAGES) {
      toast.error("Maximum 25 images allowed per product.");
      return;
    }

    for (const variant of variants) {
      if (variant.images.length === 0) {
        toast.error(
          `Please upload at least one image for ${variant.color.name}.`
        );
        return;
      }

      if (variant.images.length > MAX_IMAGES_PER_COLOR) {
        toast.error(
          `Maximum 5 images allowed for ${variant.color.name}.`
        );
        return;
      }

      if (variant.sizes.length === 0) {
        toast.error(
          `Please select at least one size for ${variant.color.name}.`
        );
        return;
      }

      if (
        variant.sizes.some(
          (item) =>
            item.stock === "" ||
            !Number.isInteger(item.stock) ||
            item.stock < 0
        )
      ) {
        toast.error(
          `Please enter valid stock for ${variant.color.name}.`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Basic information
      formData.append("name", name.trim());
      formData.append(
        "shortDescription",
        shortDescription.trim()
      );
      formData.append(
        "mediumDescription",
        mediumDescription.trim()
      );
      formData.append("description", description.trim());

      // Category and pricing
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("price", String(productPrice));
      formData.append("oldPrice", String(originalPrice));

      // Color variant metadata
      const variantData = variants.map((variant) => ({
        color: variant.color,
        imageCount: variant.images.length,
        sizes: variant.sizes,
      }));

      formData.append(
        "variants",
        JSON.stringify(variantData)
      );

      // Images must follow the same order as variantData
      variants.forEach((variant) => {
        variant.images.forEach((image) => {
          formData.append("file", image);
        });
      });

      // Features and specifications
      formData.append(
        "features",
        JSON.stringify(features)
      );

      formData.append(
        "specifications",
        JSON.stringify(specifications)
      );

      formData.append(
        "careInstructions",
        careInstructions.trim()
      );

      formData.append(
        "isFeatured",
        String(isFeatured)
      );

      // Submit
      const response = await adminAxios.post(
        "/api/v1/product/add-product",
        formData
      );

      if (response.data.success) {
        toast.success(
          response.data.message ||
            "Product added successfully."
        );

        resetForm();
      } else {
        toast.error(
          response.data.message ||
            "Failed to add product."
        );
      }
    } catch (error) {
      console.error("Add Product Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to add product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const sectionTitle =
    "text-lg font-semibold tracking-wide text-gray-700";

  const inputStyle =
    "w-full border border-gray-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none px-3 py-2 mt-2 rounded-md";

  return (
    <form
      key={formKey}
      onSubmit={onSubmitHandler}
      className="w-full pb-10"
    >
      <h1 className="text-2xl font-semibold tracking-wider text-gray-700">
        Add Product
      </h1>
 
      {/* -------------------------Product Name--------------------- */}
      <div className="mt-6 max-w-xl">
        <label className={sectionTitle}>
          Product Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputStyle}
          placeholder="Enter product name"
          required
        />
      </div>

      {/* -------------------Short Description------------------ */}
      <div className="mt-5 max-w-xl">
        <label className={sectionTitle}>
          Short Description
        </label>

        <textarea
          value={shortDescription}
          onChange={(e) =>
            setShortDescription(e.target.value)
          }
          className={inputStyle}
          rows={2}
          placeholder="Write a short product summary"
          required
        />
      </div>

      {/* ---------------Medium Description------------------- */}
      <div className="mt-5 max-w-xl">
        <label className={sectionTitle}>
          Medium Description
        </label>

        <textarea
          value={mediumDescription}
          onChange={(e) =>
            setMediumDescription(e.target.value)
          }
          className={inputStyle}
          rows={4}
          placeholder="Write more details about the product"
          required
        />
      </div>

      {/* ------------------Full Description------------------ */}
      <div className="mt-5 max-w-xl">
        <label className={sectionTitle}>
          Full Description
        </label>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className={inputStyle}
          rows={5}
          placeholder="Write complete product description"
          required
        />
      </div>

      {/* ----------------Category and Pricing-------------------- */}
      <div className="flex flex-wrap gap-5 mt-6">
        <div>
          <label className={sectionTitle}>
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputStyle}
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <label className={sectionTitle}>
            Subcategory
          </label>

          <select
            value={subCategory}
            onChange={(e) =>
              setSubCategory(e.target.value)
            }
            className={inputStyle}
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div>
          <label className={sectionTitle}>
            Product Price
          </label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputStyle}
            placeholder="100"
            required
          />
        </div>

        <div>
          <label className={sectionTitle}>
            Original Price
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            className={inputStyle}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* ----------------Product Color Variants-------------- */}
      <div className="mt-8 max-w-4xl">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <p className={sectionTitle}>
            Product Colors & Images
          </p>

          <p className="text-sm text-gray-500">
            {totalImages}/{MAX_TOTAL_IMAGES} total images
          </p>
        </div>

        {/* ------------------Add Color----------------- */}
        <div className="flex flex-wrap items-end gap-3 mt-4">
          <div className="flex-1 min-w-40">
            <label className="text-sm text-gray-600">
              Color Name
            </label>

            <input
              type="text"
              value={colorName}
              onChange={(e) =>
                setColorName(e.target.value)
              }
              className={inputStyle}
              placeholder="e.g. Black"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block">
              Select Color
            </label>

            <input
              type="color"
              value={colorHex}
              onChange={(e) =>
                setColorHex(e.target.value)
              }
              className="w-16 h-11 mt-2 cursor-pointer border rounded-md"
            />
          </div>

          <button
            type="button"
            onClick={handleAddColor}
            className="px-5 py-2.5 bg-black text-white rounded-md hover:bg-sky-600"
          >
            Add Color
          </button>
        </div>

        {/* -----------------------Color Cards ----------------------*/}
        <div className="mt-6 space-y-6">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="border border-gray-300 rounded-lg p-4"
            >
              {/* ----------------Color Header---------------- */}
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{
                      backgroundColor: variant.color.hex,
                    }}
                  />

                  <div>
                    <p className="font-semibold text-gray-700">
                      {variant.color.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {variant.color.hex}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleRemoveColor(variant.id)
                  }
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Remove Color
                </button>
              </div>

              {/* -------------------Color Images------------------ */}
              <div className="mt-5">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-700">
                    {variant.color.name} Images
                  </p>

                  <p className="text-xs text-gray-500">
                    {variant.images.length}/5 images
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-3">
                  {variant.images.map((image, index) => (
                    <div
                      key={`${variant.id}-${index}`}
                      className="relative w-24 h-24 border rounded-md overflow-hidden"
                    >
                      <img
                        src={
                          imagePreviews[variant.id]?.[index] ||
                          ""
                        }
                        alt={`${variant.color.name} ${index + 1}`}
                        className="w-full h-full object-contain"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveVariantImage(
                            variant.id,
                            index
                          )
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {variant.images.length < 5 &&
                    totalImages < MAX_TOTAL_IMAGES && (
                      <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-sky-500">
                        <span className="text-2xl text-gray-400">
                          +
                        </span>

                        <span className="text-xs text-gray-500">
                          Add Image
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(e) => {
                            handleVariantImagesChange(
                              variant.id,
                              e.target.files
                            );

                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Maximum 5 images per color. Maximum 5 MB per
                  image.
                </p>
              </div>

              {/* -----------------Color Sizes and Stock---------------- */}
              <div className="mt-6">
                <p className="font-medium text-gray-700">
                  {variant.color.name} Sizes & Stock
                </p>

                <div className="flex flex-wrap gap-4 mt-3">
                  {AVAILABLE_SIZES.map((size) => {
                    const selectedSize =
                      variant.sizes.find(
                        (item) => item.size === size
                      );

                    return (
                      <div
                        key={size}
                        className="flex flex-col gap-2"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleSizeChange(
                              variant.id,
                              size
                            )
                          }
                          className={`w-16 py-2 rounded-md font-medium transition ${
                            selectedSize
                              ? "bg-pink-500 text-white"
                              : "bg-slate-200 hover:bg-slate-300"
                          }`}
                        >
                          {size}
                        </button>

                        {selectedSize && (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={selectedSize.stock}
                            onChange={(e) =>
                              handleStockChange(
                                variant.id,
                                size,
                                e.target.value
                              )
                            }
                            className="w-20 border border-gray-300 rounded-md px-2 py-2 outline-none focus:border-sky-500"
                            placeholder="Stock"
                            aria-label={`${variant.color.name} ${size} stock`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {variants.length === 0 && (
          <div className="mt-5 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">
              No colors added yet.
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Add a color above to upload its images and manage
              its sizes.
            </p>
          </div>
        )}
      </div>

      {/* -----------------------Product Features----------------- */}
      <div className="mt-7 max-w-xl">
        <p className={sectionTitle}>
          Product Features
        </p>

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={featureInput}
            onChange={(e) =>
              setFeatureInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddFeature();
              }
            }}
            className={inputStyle}
            placeholder="e.g. Premium quality material"
          />

          <button
            type="button"
            onClick={handleAddFeature}
            className="px-5 mt-2 bg-black text-white rounded-md hover:bg-sky-600"
          >
            Add
          </button>
        </div>

        <ul className="mt-3 space-y-2">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-md"
            >
              <span className="text-sm">{feature}</span>

              <button
                type="button"
                onClick={() =>
                  handleRemoveFeature(index)
                }
                className="text-red-500 font-semibold"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* -------------------Product Specifications----------------- */}
      <div className="mt-7 max-w-xl">
        <p className={sectionTitle}>
          Product Specifications
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <input
            type="text"
            value={specName}
            onChange={(e) => setSpecName(e.target.value)}
            className={inputStyle}
            placeholder="Specification name"
          />

          <input
            type="text"
            value={specValue}
            onChange={(e) => setSpecValue(e.target.value)}
            className={inputStyle}
            placeholder="Specification value"
          />
        </div>

        <button
          type="button"
          onClick={handleAddSpecification}
          className="mt-3 px-5 py-2 bg-black text-white rounded-md hover:bg-sky-600"
        >
          Add Specification
        </button>

        <div className="mt-4 space-y-2">
          {specifications.map((spec, index) => (
            <div
              key={index}
              className="flex justify-between items-center gap-3 bg-gray-100 px-3 py-2 rounded-md"
            >
              <div className="text-sm">
                <span className="font-semibold">
                  {spec.name}:
                </span>{" "}
                {spec.value}
              </div>

              <button
                type="button"
                onClick={() =>
                  handleRemoveSpecification(index)
                }
                className="text-red-500 font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* -----------------Care Instructions--------------- */}
      <div className="mt-7 max-w-xl">
        <label className={sectionTitle}>
          Care Instructions
        </label>

        <textarea
          value={careInstructions}
          onChange={(e) =>
            setCareInstructions(e.target.value)
          }
          className={inputStyle}
          rows={3}
          placeholder="e.g. Machine wash cold, do not bleach"
        />
      </div>

      {/* -----------------Featured Product------------------ */}
      <div className="mt-6 flex items-center gap-3">
        <input
          type="checkbox"
          id="isFeatured"
          checked={isFeatured}
          onChange={(e) =>
            setIsFeatured(e.target.checked)
          }
          className="w-4 h-4 accent-black cursor-pointer"
        />

        <label
          htmlFor="isFeatured"
          className="text-gray-700 font-medium cursor-pointer"
        >
          Mark as Featured Product
        </label>
      </div>

      {/* ---------------------Submit------------------------ */}
      <button
        type="submit"
        disabled={loading}
        className="w-36 py-3 mt-8 bg-black text-white rounded-md hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}

export default Add;






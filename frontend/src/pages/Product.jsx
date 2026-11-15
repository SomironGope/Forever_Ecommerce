import { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useParams } from "react-router-dom";
import RelativeProduct from "../components/RelativeProduct";
import ReviewSection from "../components/ReviewSection";

function Products() {
  const { productId } = useParams();

  // Remount ProductDetails when productId changes.
  // This automatically resets its local state.
  return <ProductDetails key={productId} productId={productId} />;
}

function ProductDetails({ productId }) {
  const { products, currency, addToCart } = useContext(ShopContext);

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [image, setImage] = useState(null);
  const [size, setSize] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  // -----------Find Product---------------
  const productData = useMemo(
    () => products.find((item) => item._id === productId),
    [products, productId],
  );

  // Find Selected Color Variant
  // If no variant is selected, use the first variant.
  const selectedVariant = useMemo(
    () =>
      productData?.variants?.find(
        (variant) => variant._id?.toString() === selectedVariantId,
      ) || productData?.variants?.[0],
    [productData, selectedVariantId],
  );

  // ---------Scroll to top when product changes--------------------
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // ----------------Main Image------------------
  const displayImage = image || selectedVariant?.images?.[0]?.url;

  // ---------------Change Color-----------------
  const handleColorChange = (variant) => {
    setSelectedVariantId(variant._id.toString());
    setImage(null);
    setSize("");
  };

  // ------------Add To Cart----------------
  const handleAddToCart = () => {
    if (!productData || !selectedVariant || !size) return;

    addToCart(productData._id, selectedVariant._id, size);
  };



  return productData ? (
    <div>
      {/* -----------------------Product Information------------------- */}
      <div className="w-full flex justify-between sm:gap-x-3 flex-col sm:flex-row pt-10 transition-opacity ease-in duration-500 opacity-100">
        {/* =====================Left side: Product Images================= */}
        <div className="flex-1 gap-2 sm:flex-row">
          <div className="flex flex-col-reverse sm:flex-row gap-x-2">
            {/* -----------------Small Images-----------------*/}
            <div className="flex sm:flex-col overflow-x-auto gap-y-1 mt-2 sm:mt-0 sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18%] w-full">
              {selectedVariant?.images?.map((item, index) => (
                <img
                  onClick={() => setImage(item.url)}
                  src={item.url}
                  key={item.public_id || index}
                  className={`w-[24%] sm:w-full sm:mb-3 shrink-0 rounded-md cursor-pointer object-cover ${
                    displayImage === item.url ? "border-2 border-black" : ""
                  }`}
                  alt={productData.name}
                />
              ))}
            </div>

            {/* ------------------Main Image----------------- */}
            <div className="w-full sm:w-[80%] mb-1">
              {displayImage ? (
                <img
                  src={displayImage}
                  className="w-full h-125 sm:h-[98%] object-contain rounded-md"
                  alt={productData.name}
                />
              ) : (
                <div className="w-full h-75 flex items-center justify-center bg-gray-100 rounded-md text-gray-500">
                  No product image available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================Right Side: Product Details=================*/}
        <div className="flex-1 mt-5 sm:mt-0">
          {/* ------------------Product Name-------------------- */}
          <h2 className="text-sm sm:text-base text-gray-700 font-bold">
            {productData.name}
          </h2>

          {/* ----------------Product Price-------------------- */}
          <div className="mt-2">
            <span className="text-md text-gray-800 font-bold">
              {currency} {productData.price}
            </span>
          </div>

          {/* -------------Product Description----------------- */}
          <div>
            <p className="text-sm sm:text-base text-gray-500 py-1 sm:py-2">
              {productData.shortDescription || productData.description}
            </p>
          </div>

          {/* --------------------Color Variants----------------- */}
          <div className="flex flex-col gap-3 my-6">
            <p className="text-base font-medium">Select Color</p>

            <div className="flex flex-wrap gap-3">
              {productData.variants?.map((variant) => {
                const isSelected =
                  selectedVariant?._id?.toString() === variant._id?.toString();

                return (
                  <button
                    type="button"
                    key={variant._id}
                    onClick={() => handleColorChange(variant)}
                    className={`flex flex-col items-center gap-2 border rounded-md p-2 transition ${
                      isSelected
                        ? "border-black bg-gray-100"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                    aria-pressed={isSelected}
                    aria-label={`Select ${variant.color?.name || "color"}`}
                  >
                    {/* ---------------Color Product Image---------------- */}
                    {variant.images?.[0]?.url ? (
                      <img
                        src={variant.images[0].url}
                        alt={`${productData.name} - ${variant.color?.name}`}
                        className="w-16 h-20 object-cover rounded-sm"
                      />
                    ) : (
                      <span
                        className="w-16 h-20 rounded-sm border border-gray-300"
                        style={{
                          backgroundColor: variant.color?.hex || "#FFFFFF",
                        }}
                      />
                    )}

                    {/* --------------Color Name---------------*/}
                    <span className="text-sm font-medium">
                      {variant.color?.name || "Color"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---------------Available Size------------------ */}
          <div className="flex flex-col gap-4 my-8">
            <p className="text-base font-medium">Available Size</p>

            {selectedVariant ? (
              <div className="flex flex-wrap gap-2">
                {selectedVariant.sizes?.map((item) => {
                  const isOutOfStock =
                    !Number.isFinite(item.stock) || item.stock <= 0;

                  return (
                    <button
                      type="button"
                      key={item.size}
                      disabled={isOutOfStock}
                      onClick={() => setSize(item.size)}
                      className={`border py-2 px-4 rounded-sm ${
                        isOutOfStock
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                          : size === item.size
                            ? "border-orange-500 bg-orange-100 text-gray-900"
                            : "bg-gray-200 border-gray-300 hover:border-gray-500 cursor-pointer"
                      }`}
                    >
                      {item.size}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No color variant available.
              </p>
            )}

            {selectedVariant &&
              (!selectedVariant.sizes ||
                selectedVariant.sizes.length === 0) && (
                <p className="text-sm text-gray-500">
                  No sizes available for this color.
                </p>
              )}
          </div>

          {/*--------------Add To Cart-------------------*/}
          <button
            type="button"
            disabled={!selectedVariant || !size}
            onClick={handleAddToCart}
            className={`border rounded-sm py-3 px-8 text-center ml-9 outline-none text-sm font-semibold text-white transition-all duration-300 ${
              !selectedVariant || !size
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-pink-700 cursor-pointer"
            }`}
          >
            Add to Cart
          </button>

          <hr className="mt-8 sm:w-4/5 text-gray-400" />

          {/* ------------------Product Policy------------------ */}
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* -----------------Description & Reviews--------------*/}
      <div className="mt-20">
        <div className="flex gap-1 text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`border px-5 py-3 text-sm rounded-sm ${
              activeTab === "description"
                ? "bg-black text-white"
                : "bg-white text-gray-500"
            }`}
          >
            Description
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`border px-5 py-3 text-sm rounded-sm ${
              activeTab === "reviews"
                ? "bg-black text-white"
                : "bg-white text-gray-600"
            }`}
          >
            Reviews
          </button>
        </div>

        <div className="px-6 py-6">
          {/* ---------------Description------------- */}
          {activeTab === "description" ? (
            <div className="flex flex-col gap-4 px-6 py-6 text-sm text-gray-500">
              <p>{productData.description}</p>
              <hr className="mt-8  text-gray-400" />
              <div className="flex flex-col sm:flex-row gap-2 ">
                <div className="flex flex-col items-start justify-start mb-2">
                  {/* ---------------Medium Description------------- */}
                  <span className="text-lg text-gray-700">
                    Medium Description
                  </span>
                  <p>
                    {productData.mediumDescription}
                  </p>
                   
                   {/* ------------Product Features------------ */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mt-5">
                      Product Features
                    </h3>

                    {productData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 px-4 py-3 text-sm"
                      >
                        <span className="text-green-600">✓</span>
                        <ol className="text-gray-700">{feature}</ol>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="mt-8  text-gray-400" />

                <div className="flex flex-col gap-4 mb-2">
                  {/* ----------Product Specifications--------------- */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                      Product Specifications
                    </h3>

                    {productData.specifications?.length > 0 ? (
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        {productData.specifications.map((spec, index) => (
                          <div
                            key={index}
                            className={`grid grid-cols-2 gap-4 px-4 py-3 text-sm ${
                              index % 2 === 0 ? "bg-gray-200" : "bg-white"
                            }`}
                          >
                            <span className="font-medium text-gray-700">
                              {spec.name}
                            </span>

                            <span className="text-gray-600">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No specifications available.
                      </p>
                    )}
                  </div>

                  {/* ------------Care Instructions------------ */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mt-5">
                      Care Instructions
                    </h3>
                    <p>{productData.careInstructions || "Not available"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ReviewSection productId={productData._id} />
          )}
        </div>
      </div>

      {/*---------- RELATED PRODUCTS----------- */}
      <div>
        <RelativeProduct
          category={productData.category}
          subCategory={productData.subCategory}
        />
      </div>
    </div>
  ) : (
    <div className="text-2xl font-semibold">Product not found</div>
  );
}

export default Products;

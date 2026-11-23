
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

function WishList() {
  const {
    products,
    wishListItems,
    removeFromWishList,
    currency,
  } = useContext(ShopContext);

  const [loadingId, setLoadingId] = useState(null);

  const wishlistProducts = wishListItems
    .map((item) => {
      const product = products.find(
        (product) => product._id.toString() === item.productId
      );

      if (!product) return null;

      const variant = product.variants?.find(
        (variant) => variant._id.toString() === item.variantId
      );

      return {
        ...product,
        selectedVariant: variant,
      };
    })
    .filter(Boolean);

  const handleRemove = async (productId) => {
    if (loadingId) return;

    try {
      setLoadingId(productId);
      await removeFromWishList(productId);
    } catch (error) {
      console.error("Remove wishlist error:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] py-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">
        My Wishlist ({wishlistProducts.length})
      </h2>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-5">
            Your wishlist is empty.
          </p>

          <Link
            to="/collection"
            className="bg-black text-white px-6 py-3 rounded-sm inline-block"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlistProducts.map((product) => {
            const isRemoving = loadingId === product._id;

            return (
              <div
                key={product._id}
                className="border rounded-md p-3 relative hover:shadow hover:shadow-gray-700 transition"
              >
                <Link to={`/product/${product._id}`}>
                  <img
                    src={
                      product.selectedVariant?.images?.[0]?.url ||
                      product.variants?.[0]?.images?.[0]?.url ||
                      product.productImg?.[0]
                    }
                    alt={product.name}
                    className="w-full aspect-3/4 object-cover rounded-md  transition-transform hover:scale-105"
                  />

                  <h3 className="text-sm font-semibold mt-3">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-gray-800 font-medium mt-2">
                  {currency} {product.price}
                </p>

                <button
                  type="button"
                  disabled={Boolean(loadingId)}
                  onClick={() => handleRemove(product._id)}
                  className={`mt-3 text-sm text-red-600 hover:text-red-800 ${
                    loadingId
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isRemoving ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                      Removing...
                    </span>
                  ) : (
                    "Remove ❤️"
                  )}
                </button>

                <Link
                  to={`/product/${product._id}`}
                  className="block text-center bg-black text-white py-2 mt-3 rounded-sm text-sm"
                >
                  View Product
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WishList;


import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";

const ProductCard = ({ product }) => {
  const { toggleWishList, isInWishList } =
    useContext(ShopContext);

  const [loading, setLoading] = useState(false);

  if (!product?._id) return null;

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);
      await toggleWishList(product._id);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isWishlisted = isInWishList(product._id);

  return (
    <button
      type="button"
      onClick={handleWishlist}
      disabled={loading}
      aria-label={
        loading
          ? "Updating wishlist"
          : isWishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className={`absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition ${
        loading
          ? "cursor-not-allowed opacity-60"
          : "hover:scale-110"
      }`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
      ) : (
        isWishlisted ? "❤️" : "🤍"
      )}
    </button>
  );
};

export default ProductCard;

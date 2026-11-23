
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCart";

function ProductItem({ _id, image, name, price, oldPrice }) {
  const { currency } = useContext(ShopContext);

  const hasDiscount = oldPrice > price;

  const discountPercent = hasDiscount
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  const product = {
    _id,
    image,
    name,
    price,
    oldPrice,
  };

  return (
    <div className="text-center">

      {/* Product Image and Wishlist Button */}
      <div className="relative bg-gray-50 overflow-hidden rounded-md border p-3 hover:shadow hover:shadow-gray-700 transition">

        <Link to={`/product/${_id}`}>
          <img
            className="w-full aspect-3/4 rounded-md object-cover transition-transform hover:scale-105"
            src={image}
            alt={name}
          />
        </Link>

        <ProductCard product={product} />

      </div>

      {/* Product Name and Price */}
      <Link to={`/product/${_id}`}>

        <p className="pt-3 pb-1 text-sm font-semibold text-gray-800">
          {name}
        </p>

        <div className="flex items-center justify-between gap-2">

          <p className="flex text-md text-gray-900 gap-1">
            {currency} {price}
          </p>

          {hasDiscount && (
            <div>
              <p className="text-sm text-gray-500 line-through">
                {currency} {oldPrice}
              </p>

              <span className="flex bg-red-500 text-white px-2 py-1 rounded text-xs">
                {discountPercent}% OFF
              </span>
            </div>
          )}

        </div>

      </Link>

    </div>
  );
}

export default ProductItem;


import Title from "./Title";
import ProductItem from "./ProductItem";

function LatestCollection({ products = [] }) {
  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1="LATEST" text2="COLLECTIONS" />

        <p className="w-3/4 max-w-2xl m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Explore our newest arrivals, featuring fresh styles and carefully
          selected pieces made for every occasion.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
          {products.map((item) => (
            <ProductItem
              key={item._id}
              _id={item._id}
              image={item.productImg?.[0]?.url}
              name={item.name}
              price={item.price}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500 py-10">
          {products.length === 0
            ? "No matching latest products found."
            : "No latest products available at the moment."}
        </p>
      )}
    </div>
  );
}

export default LatestCollection;

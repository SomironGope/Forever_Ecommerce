
import { useContext, useMemo } from "react";
import BestSeller from "../components/BestSeller";
import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import NewLetterBox from "../components/NewLetterBox";
import OurPolicy from "../components/OurPolicy";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";

function Home() {

  const { latestProduct, bestSellers, search } = useContext(ShopContext);

  const searchText = (search || "").trim().toLowerCase();

  const allProducts = useMemo(() => {
    const productMap = new Map();

    [...(latestProduct || []), ...(bestSellers || [])].forEach((item) => {
      productMap.set(item._id, item);
    });

    return Array.from(productMap.values());
  }, [latestProduct, bestSellers]);

  const filteredProducts = useMemo(() => {
    if (!searchText) return [];

    return allProducts.filter((item) =>
      (item.name || "").toLowerCase().includes(searchText)
    );
  }, [allProducts, searchText]);

  const isSearching = searchText.length > 0;

  return (
    <div>
      {isSearching ? (
        <div className="my-8">
          <div className="text-xl sm:text-2xl mb-6">
            <p>
              SEARCH <span className="font-semibold">RESULTS</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {filteredProducts.length} products found for "{searchText}"
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
              {filteredProducts.map((item) => (
                <ProductItem
                  key={item._id}
                  _id={item._id}
                  image={item.productImg?.[0]?.url}
                  name={item.name}
                  oldPrice={item.oldPrice}
                  price={item.price}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-16">
              No matching products found. Try another search.
            </p>
          )}
        </div>
      ) : (
        <>
          <Hero />
          <LatestCollection products={latestProduct || []} />
          <BestSeller products={bestSellers || []} />
          <OurPolicy />
          <NewLetterBox />
        </>
      )}
    </div>
  );
}

export default Home;

import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import adminAxios from "../utils/AdminAxios";

function Products() {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const currency = "⃁";

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await adminAxios.get("/api/v1/product/all-product");

        if (response.data.success) {
          setProduct(response.data.products || []);
        } else {
          toast.error(response.data.message || "Failed to load products.");
        }
      } catch (error) {
        console.log(error);
        toast.error(
          error.response?.data?.message || "Failed to load products.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  // -------------------------Remove Product-----------------------------
  const removeProduct = async (id) => {
    if (deletingId !== null) return;

    setSelectedProductId(id);
    setShowDeleteModal(true);
  };

  const confirmRemoveProduct = async () => {
    if (!selectedProductId || deletingId !== null) return;

    const id = selectedProductId;

    try {
      setDeletingId(id);

      const response = await adminAxios.delete(`/api/v1/product/${id}`);

      if (response.data.success) {
        setProduct((prev) => prev.filter((item) => item._id !== id));
        toast.success(response.data.message || "Product deleted successfully.");
      } else {
        toast.error(response.data.message || "Failed to delete product.");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setSelectedProductId(null);
    }
  };

  return (
    <>
      <h1 className="text-lg md:text-2xl mb-2 font-semibold">All Products</h1>

      {loading ? (
        <p className="py-8 text-center text-gray-500">Loading products... </p>
      ) : product.length === 0 ? (
        <p className="py-8 text-center text-gray-500">No Products found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* ---------- Desktop/tablet table header -------------- */}

          <div className="hidden md:grid grid-cols-[0.8fr_2fr_1fr_1fr_1.3fr] items-center gap-3 px-3 py-3  border border-slate-300 bg-gray-100 text-sm rounded-md">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Actions</b>
          </div>

          {/* -----------Product List ------------*/}

          
                  {showDeleteModal && (
                    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
                      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-gray-800 text-center">
                          Delete Product
                        </h2>

                        <p className="mt-3 text-sm text-gray-600 text-center">
                          Are you sure you want to delete this product?
                        </p>

                        <div className="mt-6 flex justify-center gap-3">
                          <button
                            type="button"
                            disabled={deletingId !== null}
                            onClick={() => {
                              setShowDeleteModal(false);
                              setSelectedProductId(null);
                            }}
                            className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            disabled={deletingId !== null}
                            onClick={confirmRemoveProduct}
                            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingId !== null ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

          {product.map((item) => (
            <div key={item._id}>
              {/* -------------------Moblie product card-------------------- */}
              <div className="md:hidden border border-gray-200 rounded-lg p-3 flex flex-col gap-3 bg-white shadow-sm">
                <div className="flex items-center justify-center gap-3 min-w-0">
                  <img
                    src={item.productImg?.[0]?.url || "/placeholder.png"}
                    alt={item.name || "Product"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/placeholder.png";
                    }}
                    className="w-20 h-24 shrink-0 object-contain rounded-md bg-gray-50"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm wrap-break-word">
                      {item.name || "Unnamed product"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.category || "Uncategorized"}
                    </p>
                    <p className="font-semibold mt-2">
                      {" "}
                      {currency} {item.price}{" "}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/update-product/${item._id}`}
                    aria-disabled={deletingId !== null}
                    onClick={(e) => {
                      if (deletingId !== null || showDeleteModal) e.preventDefault();
                    }}
                  >
                    <p
                      className={`text-white px-3 py-2 rounded  text-sm text-center 
                     ${deletingId !== null ? "bg-sky-300 pointer-events-none" : "bg-sky-500 hover:bg-sky-600"}
                    `}
                    >
                      Edit
                    </p>
                  </Link>

                  <button
    type="button"
    disabled={deletingId !== null}
    onClick={() => removeProduct(item._id)}
    className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 disabled:opacity-50"
  >
    Delete
  </button>

                </div>
              </div>

              {/* ------------------------Tablet/ Desktop table row------------------- */}

              <div className="hidden md:grid grid-cols-[0.8fr_2fr_1fr_1fr_1.3fr] items-center gap-3 py-2 px-3 border border-gray-200 rounded-md text-sm">
                <img
                  src={item.productImg?.[0].url || "/placeholder.png"}
                  alt={item.name || "Product"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder.png";
                  }}
                  className="w-16 h-16 object-contain rounded-md bg-gray-5"
                />
                <p className="wrap-break-word">
                  {item.name || "Unnamed product"}
                </p>

                <p className="wrap-break-word">
                  {item.category || "Uncategorized"}
                </p>

                <p className="font-medium">
                  {" "}
                  {currency} {item.price}
                </p>

                <div className="flex flex-wrap lg:flex-row gap-2">
                  <Link
                    to={`/update-product/${item._id}`}
                    onClick={(e) => {
                      if (deletingId !== null) e.preventDefault();
                    }}
                    className={`text-white px-5 py-1.5 rounded ${
                      deletingId !== null
                        ? "bg-sky-300 pointer-events-none"
                        : "bg-sky-500 hover:bg-sky-600"
                    }`}
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    disabled={deletingId !== null}
                    onClick={() => removeProduct(item._id)}
                    className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                  >
                    {deletingId === item._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default Products;

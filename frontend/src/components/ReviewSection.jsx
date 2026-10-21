
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { ShopContext } from "../context/ShopContext";
import api from "../utils/axiosInstance";


const Stars = ({ value, interactive = false, onChange }) => {

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onChange(star)}
          className={`text-xl ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          } ${interactive ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const ReviewSection = ({ productId }) => {

  const { token, user } = useContext(ShopContext);

  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  //------------------------Fetch Review--------------------------

  const fetchReview = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/api/v1/review/product/${productId}`,
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
        setTotalReviews(response.data.totalReviews);
        setAverageRating(response.data.averageRating);
      }
    } catch (error) {
      console.log("Fetch Reviews Error:", error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // -------------------Get Product ID---------------------

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    const loadReviews = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          `/api/v1/review/product/${productId}`,
        );

        if (!cancelled && response.data.success) {
          setReviews(response.data.reviews);
          setTotalReviews(response.data.totalReviews);
          setAverageRating(response.data.averageRating);
        }
      } catch (error) {
        if (!cancelled) {
          console.log("Fetch Review Error:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  //-------------------------Add Review---------------------------

  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login to write a review");

      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");

      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/api/v1/review/add",
        {
          productId,
          rating,
          comment,
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);

        setComment("");
        setRating(5);

        fetchReview();
      }
    } catch (error) {
      console.log(error.response?.data);
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------Delete Review--------------------------

  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmDelete) return;

    try {
      const response = await api.delete(
        `/api/v1/review/${reviewId}`,
      );

      if (response.data.success) {
        toast.success(response.data.message);

        fetchReview();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  // ==============Start Editing===============

  const statEdit = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  // ================Cancel Editing ===============

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  // =========================Update Review=========================

  const handleUpdateReview = async (reviewId) => {
    if (!editComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await api.put(
        `/api/v1/review/${reviewId}`,
        {
          rating: editRating,
          comment: editComment,
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);

        cancelEdit();
        fetchReview();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update review");
    }
  };

  const distribution = reviews.reduce(
    (acc, review) => {
      acc[review.rating]++;
      return acc;
    },
    {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  );

  // -----------------------------Start Component------------------

  return (
    <section className="mt-16 border-t pt-10">
      {/* ----------------Header--------------- */}

     <div className="rounded-2xl border bg-white p-6 shadow-sm">
  <div className="grid gap-8 md:grid-cols-2">

    {/* Rating Summary */}
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">
        Customer Reviews
      </h2>

      <div className="mt-5 flex items-center gap-5">
        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border bg-yellow-50">
          <span className="text-3xl font-bold text-yellow-600">
            {Number(averageRating).toFixed(1)}
          </span>

          <span className="text-xs text-gray-500">
            out of 5
          </span>
        </div>

        <div>
          <Stars value={Math.round(Number(averageRating))} />

          <p className="mt-2 text-sm text-gray-500">
            Based on {totalReviews}{" "}
            {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>
    </div>

    {/* Rating Distribution */}
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star];

        const percentage =
          totalReviews > 0
            ? (count / totalReviews) * 100
            : 0;

        return (
          <div
            key={star}
            className="flex items-center gap-3"
          >
            <span className="w-10 text-sm font-medium text-gray-700">
              {star} ★
            </span>

            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-linear-to-r from-yellow-400 to-orange-500 transition-all duration-700"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

            <span className="w-8 text-right text-sm text-gray-500">
              {count}
            </span>
          </div>
        );
      })}
    </div>

  </div>
</div>

      {/* ------------------Add Review----------------- */}

      {token ? (
        <form
          onSubmit={handleAddReview}
          className="mb-10 rounded-lg border p-5"
        >
          <h3 className="mb-4 text-lg font-medium">Write a Review</h3>

          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-600">Your Rating</p>

            <Stars value={rating} interactive={true} onChange={setRating} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            rows="4"
            className="px-1 outline-none border-sky-500"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-md bg-black px-6 py-3 text-sm text-white disabled:opacity-50 hover:opacity-80 transition-all duration-200 cursor-pointer"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="mb-10 rounded-lg border p-5 text-gray-600">
          Please login to write a review
        </div>
      )}

      {/* -------------------Review------------------ */}

      <div>
        {loading ? (
          <p className="text-gray-500">Loading review...</p>
        ) : reviews.length === 0 ? (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-gray-500">No reviews yet.</p>

            <p className="mt-1 text-sm text-gray-400">
              Be the first person to review this product.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => {
              const reviewUserId = review.userId?._id || review.userId;

              const currentUserId = user?._id;

              const isOwner =
                reviewUserId &&
                currentUserId &&
                reviewUserId.toString() === currentUserId.toString();

              return (
                <div key={review._id} className="border-b pb-6">
                  {/* -----------User----------------- */}
                  <div className="flex items-start justify-between">
                    <div className="w-full flex items-center gap-3">
                      {review.userId?.profilePic ? (
                        <img
                          src={review.userId.profilePic}
                          alt="profile"
                          className="h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-medium"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-medium">
                          {review.userId?.firstName?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </div>
                      )}

                      <div className="bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {review.userId?.firstName}{" "}
                              {review.userId?.lastName}
                            </h3>

                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-yellow-500">
                            {"⭐".repeat(review.rating)}
                          </div>
                        </div>

                        <p className="mt-3 text-gray-700"> {review.comment}</p>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex gap-2 text-sm">
                        <button
                          onClick={() => statEdit(review)}
                          className="px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded cursor-pointer"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* --------------Verified Purchased----------- */}

                  {review.verifiedPurchase && (
                    <p className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full mt-4">
                      ✓ Verified Purchase
                    </p>
                  )}

                  {/* ----------------Edit Form------------ */}

                  {editingReviewId === review._id ? (
                    <div className="mt-4 rounded-md bg-gray-400 p-4">
                      <Stars
                        value={editRating}
                        interactive={true}
                        onChange={setEditRating}
                      />

                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows="3"
                        className="mt-3 w-full rounded-md border p-3 outline-none border-sky-500"
                      />

                      <div className="mt-3 flex gap-3">
                        <button
                          onClick={() => handleUpdateReview(review._id)}
                          className="rounded-md bg-black px-4 py-2 text-sm text-white"
                        >
                          Save
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="rounded-md bg-black px-4 py-2 text-sm text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-gray-700">{review.comment}</p>
                  )}

                  {/*------------------Data------------------*/}

                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;


import { useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import api from "../utils/axiosInstance";
import { ShopContext } from "../context/ShopContext";

function PaymentSuccess() {
  const { token } = useContext(ShopContext);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const verifyPayment = async () => {
      try {
        // 1. Check payment ID
        if (!paymentId) {
          throw new Error("Payment ID is missing");
        }

        // 2. Check authentication
        if (!token) {
          throw new Error("Please log in to verify your payment");
        }

        // 3. Verify payment through backend
        // Backend checks the actual payment status with Moyasar.
        const response = await api.post(
          "/api/v1/payment/moyasar/verify",
          { paymentId },
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Payment verification failed",
          );
        }

        if (active) {
          setSuccess(true);
        }
      } catch (error) {
        console.error(
          "Payment verification error:",
          error.response?.data || error.message,
        );

        const message =
          error.response?.data?.message ||
          error.message ||
          "We could not verify your payment.";

        if (active) {
          setSuccess(false);
          setErrorMessage(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    verifyPayment();

    return () => {
      active = false;
    };
  }, [paymentId, token]);

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Verifying payment...
          </h2>

          <p className="mt-2 text-gray-500">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  // Failed verification
  if (!success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="mb-4 text-xl font-semibold text-red-600">
            Payment Not Confirmed
          </h2>

          <p className="text-gray-500">
            {errorMessage || "We could not verify your payment."}
          </p>

          <button
            onClick={() => navigate("/orders")}
            className="mt-5 cursor-pointer rounded bg-black px-6 py-2 text-white"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  // Successful payment
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-green-600">
          Payment Successful 🎉
        </h2>

        <p className="mt-2 text-gray-500">
          Your payment has been verified successfully.
        </p>
      </div>

      <button
        onClick={() => navigate("/orders")}
        className="mt-5 cursor-pointer rounded bg-black px-6 py-2 text-white"
      >
        View My Orders
      </button>
    </div>
  );
}

export default PaymentSuccess;

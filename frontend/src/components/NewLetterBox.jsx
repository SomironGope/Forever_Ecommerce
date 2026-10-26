import { useState } from "react";
import { toast } from "react-toastify";

function NewLetterBox() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  // -----------------------Submit Handler--------------------
  const onSubmitHandler = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLocaleLowerCase();
    if (!trimmedEmail) {
      toast.error("Please enter your email address");

      return;
    }
    try {
      setLoading(true);
      toast.success("Thank you for subscribing !");

      setEmail("");
    } catch (error) {
      console.error("Unable to subscribe. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-10 text-center px-4">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>
      <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">
        Join our newsletter and be the first to know about new arrivals,
        exclusive offers, and special discounts.
      </p>
      <form
        onSubmit={onSubmitHandler}
        className=" sm:flex sm:items-center sm:justify-center sm:gap-x-2"
      >
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="text-sm px-2 py-2 w-full sm:w-1/2 flex items-center gap-3 my-6 border pl-3 outline-none rounded-sm focus:border-sky-600"
        />

        <button
          type="submit"
          disabled={loading}
          className=" bg-black text-white text-xs px-10 py-3 hover:transition-all hover:ease-in-out hover:duration-200 uppercase rounded-md hover:bg-pink-800 hover:cursor-pointer "
        >
          {loading ? "Subscribing..." : "Subscribe"}{" "}
        </button>
      </form>
    </div>
  );
}

export default NewLetterBox;

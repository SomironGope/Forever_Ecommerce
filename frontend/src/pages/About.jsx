import { assets } from "../assets/products";
import Title from "../components/Title";

function About() {
  return (
    <main className="px-4 sm:px-8 md:px-14 lg:px-20 py-10">
      {/* ---------------------Page Heading---------------------- */}
      <div className="text-center mb-10">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      {/* ------------------Brand Introduction------------------- */}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <picture>
          <source media="(min-width: 768px)" srcSet={assets.forver_banner} />

          <img
            src={assets.small_device_banner}
            alt="Forever fashion collection"
            className="w-full h-64 sm:h-80 md:h-100 object-position object-center rounded-md"
          />
        </picture>

        <div className="text-gray-600 space-y-5">
          <h2 className="text-xl font-semibold text-gray-800">
            {" "}
            Welcome to Forever
          </h2>

          <p className="leading-7">
            Welcome to Forever, your destination for discovering fashionable
            clothing for everyday life. We aim to make shopping simple with
            carefully presented products and a convenient online shopping
            experience.
          </p>

          <p className="leading-7">
            From exploring our collections to placing an order, we want every
            step of your shopping journey to feel easy, clear, and enjoyable.
          </p>
        </div>
      </section>

      {/* ------------------------Mission--------------------------- */}

      <section className="mt-16">
        <h2 className="text-xl font-semibold mb-4">Our Mission</h2>

        <p className="leading-7">
          Our mission is to make discovering and shopping for fashion simple,
          enjoyable, and accessible. We aim to deliver a smooth experience from
          browing products to receiving an order.
        </p>
      </section>
      {/* --------------------------Why Choose Us-------------------- */}

      <section className="mt-16">
        <h2 className="text-xl from-taupe-50 mb0=8">
          WHY CHOOSE <span className="text-gray-500">US</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-gray-200">
          <div className="p-6">
            <h3 className="font-semibold mb-3">Quality Products</h3>

            <p className="text-sm text-gray-600">
              Explore clothing selected with style and everyday comfort in mind.
            </p>
          </div>

          <div className="p-6 border-y sm:border-y-0 sm:border-x border-gray-200">
            <h3 className="font-semibold mb-3">Easy Shopping</h3>

            <p className="text-sm text-gray-600">
              Brower collections and place orders through a simple online
              shopping experience.
            </p>
          </div>

          <div className="p-6 border-y sm:border-y-0 sm:border-x border-gray-200">
            <h3 className="font-semibold mb-3">Customer Support</h3>
            <p>
              We aim to make your shopping journey straightforward and
              convenient.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;

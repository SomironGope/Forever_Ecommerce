import { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useParams } from "react-router-dom";
import RelativeProduct from "../component/RelativeProduct";


function Products() {
  const { products,currency,addToCart } = useContext(ShopContext);
  const { productId } = useParams();
  const [image, setImage] = useState(null);
  const [size,setSize] = useState('')



  const productData = useMemo (() => products.find((item) => item._id ===  productId)
,[products, productId])

  // const productData = products.find((item) => item.id === Number(productId));

  // console.log(productData);

  const displayImage = image || productData?.productImg?.[0]?.url;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // if (!productData) {
  //   return <div>Loading...</div>;
  // }


  


  console.log("URL productId:", productId);
console.log("Products:", products);
console.log(
  "IDs:",
  products.map((item) => item._id)
);

  return productData ? (
    <div className="">
      {/* ------------------Product Data -------------------*/}
      <div className="w-full flex justify-between sm:gap-x-3 flex-col sm:flex-row border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">

       {/* ----------------------Left Side---------------------- */}
      
        {/* ---------------Product Images----------------- */}

        <div className="flex-1  gap-2 sm:flex-row">

          {/* ------------------Product Imgaes---------------------- */}
          <div className="flex flex-col-reverse sm:flex-row gap-x-2 ">
            {/* ----------------------Small Images ----------------- */}
            <div className="flex sm:flex-col overflow-x-auto gap-y-1 sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18%] w-full">
              {productData.productImg?.map((item, index) => (
                <img
                  onClick={() => setImage(item.url)}
                  src={item.url}
                  key={index}
                  className=" w-[24%] sm:w-full sm:mb-3 shrink-0 rounded-md cursor-pointer object-fill"
                  alt={productData.name}
                />
              ))}
            </div>

            {/* // ---------------Main Image---------------------// */}

            <div className="w-full sm:w-[80%] mb-1">
              <img
                src={displayImage}
                className="w-full h-120 sm:h-[98%] object-fill rounded-md "
                alt={productData.name}
              />
            </div>
          </div>

          </div>
          {/* -----------------------Right Side ------------------- */}
          {/*--------------- Product Info ---------------  */}
          <div className="flex-1 mt-5 sm:mt-0 ">
            <div>
              <h2 className="text-sm sm:text-base text-gray-700 font-bold">{productData.name}</h2>
            </div>
            {/* <div className="flex justify-start gap-x-0.5 py-1 sm:py-2">
              <img
                src={productData.starIcon}
                alt={productData.starIcon}
                className="w-4 object-contain "
              />
              <img
                src={productData.starIcon}
                alt={productData.starIcon}
                className="w-4 object-contain "
              />
              <img
                src={productData.starIcon}
                alt={productData.starIcon}
                className="w-4 object-contain "
              />
              <img
                src={productData.starIcon}
                alt={productData.starIcon}
                className="w-4 object-contain"
              />
              <img
                src={productData.haflStar}
                alt={productData.haflStar}
                className="w-4 object-contain"
              />

              <span className="text-sm sm:text-base font-medium">{productData.rating}</span>
            </div> */}
              <div>
               <span className="text-md text-gray-800 font-bold"> {productData.price} {currency}</span>
            </div>
            <div>
              <p className="text-sm sm:text-base text-gray-500 py-1 sm:py-2">{productData.description}</p>
            </div>
             
             <div className="flex flex-col gap-4 my-8">
                <p className="text-base sm:text-md font-medium ">Select Size</p>
                <div className="flex gap-2">
                  {productData?.sizes?.map((item,index)=> (
                    <button onClick = {() => setSize(item)} className= {`border py-2 px-4 rounded-sm cursor-pointer
                      ${size === item ? "border-orange-500 bg-orange-100" : "bg-gray-200"}`} key={index}>{item}</button>
                  ))}
                </div>
             </div>
             {/* -------------------AddToCart-------------------------------- */}
             <button onClick={() => addToCart(productData._id,size)} className="border bg-black rounded-sm py-3 px-8 text-center ml-9 outline-none text-sm font-semibold text-white transition-all ease-in-out duration-300 hover:bg-pink-700 cursor-pointer">Add to Cart</button>
            <hr className="mt-8 sm:w-4/5 text-gray-400"/>
            <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
               <p>100% Original Product.</p>
               <p>Cash on delivery is avaible on this product.</p>
               <p>Easy return and exchange policy within 7 days.</p>

            </div>

           
          </div>
          
          </div>
           {/* ------------------Description and Review-------------- */}
            <div className="mt-20">
               <div className="flex gap-1 text-gray-600">
                 <b className="border px-5 py-3 text-sm rounded-sm">Description</b>
                 <p className="border px-5 py-3 text-sm rounded-sm">Reviews </p>
               </div>
               <div className="flex flex-col gap-4 px-6 py-6 text-sm text-gray-500">
                   <p>An e-commerce website is an online platform that facilitates the buying and selling of product or services over the internet. it services as a virtual marketplace where businessses and individuals can showcase their products, interact with customers, and conduct transition.  </p>
                  <p>E-commerce is the process of buying and selling products or services through the internet. It allows customers to browse products, compare prices, and make purchases from anywhere at any time. Online stores provide a convenient shopping experience by offering secure payment methods, fast delivery services, and a wide range of products. Businesses use e-commerce platforms to reach customers globally, reduce operational costs, and increase sales. With the growth of digital technology and mobile devices, e-commerce has become one of the most important sectors in the modern economy.
</p>
               </div>
            </div>
            <div>
                <RelativeProduct category={productData.category} subCategory={productData.subCategory} />
            </div>

        
      </div>
  
  ) : (
    <div className="text-2xl font-semibold">Product not found</div>
  );
}

export default Products;

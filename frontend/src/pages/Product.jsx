import { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useParams } from "react-router-dom";
import RelativeProduct from "../components/RelativeProduct";
import ReviewSection from "../components/ReviewSection";



function Products() {
  const { products,currency,addToCart } = useContext(ShopContext);
  const { productId } = useParams();
  const [image, setImage] = useState(null);
  const [size,setSize] = useState('')

  const [activeTab, setActiveTab] = useState("description")



  const productData = useMemo (() => products.find((item) => item._id ===  productId),
  [products, productId])



  const displayImage = image || productData?.productImg?.[0]?.url;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  


  

  return productData ? (
    <div className="">
      {/* --------------------Product Data ---------------------*/}
      <div className="w-full flex justify-between sm:gap-x-3 flex-col sm:flex-row pt-10 transition-opacity ease-in duration-500 opacity-100">

       {/* ----------------------Left Side---------------------- */}
      
        {/* -------------------Product Images------------------- */}

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
          {/*--------------------- Product Info --------------------  */}
          <div className="flex-1 mt-5 sm:mt-0 ">
            <div>
              <h2 className="text-sm sm:text-base text-gray-700 font-bold">{productData.name}</h2>
            </div>
           
              <div className="">
               <span className="text-md text-gray-800 font-bold"> {currency} {productData.price} </span>

               
            </div>
            <div>
              <p className="text-sm sm:text-base text-gray-500 py-1 sm:py-2">{productData.description}</p>
            </div>
             
             <div className="flex flex-col gap-4 my-8">
                <p className="text-base sm:text-md font-medium ">Select Size</p>
                <div className="flex gap-2">

                  {productData?.sizes?.map((item)=> {
                    
                    const isOutOfStock = !Number.isFinite(item.stock) || item.stock <= 0;

                    return (
                       
                    <button 
                    type="button"
                    key={item.size}
                    disabled = {isOutOfStock}
                    onClick = {() => setSize(item.size)} 

                    className= {`border py-2 px-4 rounded-sm cursor-pointer
                      ${isOutOfStock? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                        : size === item.size ? "border-orange-500  bg-orange-100 text-gray-900" 
                        : "bg-gray-200 border-gray-300 hover:border-gray-500 cursor-pointer"}`}>
                           {item.size} 
                           {isOutOfStock && ""}
                     </button>
                  
                  
                    )

               })}

                  
                </div>
             </div>
             
             {/* -------------------------------AddToCart-------------------------------- */}
             <button 
               type= "button"
               disabled = {!size}

               onClick={() => addToCart(productData._id, size)} 
              className= {`border  rounded-sm py-3 px-8  text-center ml-9 outline-none text-sm font-semibold text-white transition-all  duration-300
                  ${!size ? "bg-gray-400 cursor-not-allowed"
                     : "bg-black hover:bg-pink-700 cursor-pointer"}`}
                >
              Add to Cart</button>

              
            <hr className="mt-8 sm:w-4/5 text-gray-400"/>

               
            <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
               <p>100% Original Product.</p>
               <p>Cash on delivery is avaible on this product.</p>
               <p>Easy return and exchange policy within 7 days.</p>

            </div>

           
          </div>
          
          </div>
           {/* ------------------------Description and Review---------------------- */}
            <div className="mt-20">
               <div className="flex gap-1 text-gray-600">
                 <button type="button"
                  onClick={() => setActiveTab("description")}
                  className= {`border px-5 py-3 text-sm rounded-sm ${activeTab === "description" 
                    ? "bg-black text-white" : "bg-white text-gray-500"
                  }`}
                 >
                 Description    
                 </button>

                 <button
                   type = "button"
                   onClick={() => setActiveTab ("reviews")}
                   className= {`border px-5 py-3 text-sm rounded-sm ${activeTab === "reviews" 
                    ? "bg-black text-white" : "bg-white text-gray-600"}`}
                      >

                   Reviews
                 </button>

               </div>
               <div className="px-6 py-6">

                {activeTab === "description" ? (
                  <div  className="flex flex-col gap-4 px-6 py-6 text-sm text-gray-500">
                     <p>{productData.description}</p>
                    </div>
                ) : (
                  <ReviewSection productId={productData._id} />
                )
              }
                   
               </div>
            </div>
            {/*------------------------------- Related Products-------------------------------- */}
            <div>
                <RelativeProduct category={productData.category} subCategory={productData.subCategory} />
            </div>

        
      </div>
  
  ) : (
    <div className="text-2xl font-semibold">Product not found</div>
  );
}

export default Products;

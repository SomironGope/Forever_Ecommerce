

import { useContext } from "react";
import Title from "./Title";
import { ShopContext } from "../context/ShopContext";

import ProductItem from '../component/ProductItem';

 function LatestCollection() {

const {latestProduct} = useContext(ShopContext);




  return (
    <div className="my-10">

      {/* ---Heading--- */}
       <div className="text-center py-8 text-3xl">
           <Title text1={'LATEST'} text2={'COLLECTIONS'}/>

           <p className="w-3/4 max-w-2xl m-auto text-xs sm:text-sm md:text-base text-gray-600">
              Explore our newest arrivals, featuring fresh styles and carefully
               selected pieces made for every occasion.</p>
       </div>


       {/* Rendering Products */}

       {
        latestProduct?.length > 0 ? (

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
         {
         latestProduct.map((item) =>(
          <ProductItem key = {item._id} _id = {item._id} image = {item.productImg?.[0]?.url} name = {item.name} price = {item.price}  />
         ))
          
         }
       </div>

        ): (
          <p className="text-center text-sm text-gray-500 py-10">
            No latest products available at the moment.
          </p>
        )
       }

       
    </div>
  )
}

export default LatestCollection;
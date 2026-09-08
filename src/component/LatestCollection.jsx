

import { useContext } from "react";
import Title from "./Title";
import { ShopContext } from "../context/ShopContext";

import ProductItem from '../component/ProductItem';

 function LatestCollection() {

const {latestProduct} = useContext(ShopContext);




  return (
    <div className="my-10">
       <div className="text-center py-8 text-3xl">
           <Title text1={'LATEST'} text2={'COLLECTIONS'}/>
           <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
       </div>
       {/* Rendering Products */}

       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
         {
         latestProduct.map((item) =>(
          <ProductItem key = {item._id} _id = {item._id} image = {item.productImg?.[0]?.url} name = {item.name} price = {item.price} />
         ))
          
         }
       </div>
    </div>
  )
}

export default LatestCollection;
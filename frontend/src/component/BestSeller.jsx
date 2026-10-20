import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';

import Title from './Title';
import ProductItem from './ProductItem';

function BestSeller() {

  const {bestSellers} = useContext (ShopContext);
  
 
  return (
    <div className='my-10'>

       {/* ---Heading--- */}
       <div className='text-center text-3xl py-8'>

            <Title text1={'BEST'} text2={'SELLER'} />

            <p className='w-3/4 m-auto text-sm sm:text-sm md:text-base text-gray-600'>
           Discover our most popular products, loved and chosen by our
          customers. Shop the styles that everyone is talking about.</p>
       </div>
       
       {/* ---Products--- */}
       {bestSellers?.length > 0 ? (

         <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>

       
         {bestSellers.map((item) => (
          <ProductItem key={item._id} _id= {item._id} image = {item.productImg?.[0]?.url} name = {item.name} price = {item.price} />
         ))}
       </div>
        ): (
          <p className='text-center text-sm text-gray-500 py-10'>
             No best-selling products available at the moment.
          </p>
        )
      }
      
    </div> 
  )
     
 
}

export default BestSeller;
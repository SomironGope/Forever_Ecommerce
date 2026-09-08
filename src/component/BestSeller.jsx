import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';

import Title from './Title';
import ProductItem from './ProductItem';

function BestSeller() {
  const {bestSellers} = useContext (ShopContext);
  
  // const bestSeller = products.filter((item) => item?.category === 'kid').slice(0,5)
 
 
  return (
    <div className='my-10'>
       <div className='text-center text-3xl py-8'>
            <Title text1={'BEST'} text2={'SELLER'} />
            <p className='w-3/4 m-auto text-sm sm:text-sm md:text-base text-gray-600'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi reprehenderit aspernatur harum distinctio quisquam itaque a laboriosam. Ad cumque, dolores unde nihil quidem dolorum autem esse sed porro eligendi rerum!</p>
       </div>
       <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
         {bestSellers.map((item) => (
          <ProductItem key={item._id} _id= {item._id} image = {item.productImg?.[0]?.url} name = {item.name} price = {item.price} />
         ))}
       </div>
    </div> 
  )
     
 
}

export default BestSeller;
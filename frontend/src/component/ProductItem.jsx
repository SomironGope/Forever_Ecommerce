import {ShopContext} from '../context/ShopContext';
import {useContext} from 'react';

import {Link} from 'react-router-dom';


function ProductItem({_id,image,name,price,oldPrice}) {

const {currency} = useContext(ShopContext)


const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100 ) : 0;
 
const hasDiscount = oldPrice > price;

  return (
    <Link to = {`/product/${_id}`} className='text-center '>
       <div className="overflow-hidden ">
          <img className = 'w-full  h-55 md:h-55 lg:h-65 rounded-md hover:scale-110 transition ease-in-out object-fill' src= {image } alt="" />
       </div>
       <p className="pt-3 pb-1 text-sm font-semibold text-gray-800">{name}</p>


       <div className='flex items-center justify-between gap-2'>

        <p className="flex text-md text-gray-900 ">{currency} {price}  </p>

        {/* Discount */}
         
         <div >

            {
               hasDiscount && (
                <div>
                     <p className="text-sm  text-gray-500 line-through"> {currency} {oldPrice}  </p>
  
                  
                      <span className='flex bg-red-500 text-white px-2 py-1 rounded text-xs'>
                        {discountPercent} % OFF
                    </span>
              
             
                  
                  
                  </div>
               )
            } 

             
         </div>
          
           
       </div>
       
    </Link>

  )
}

export default ProductItem;

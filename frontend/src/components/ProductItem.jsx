import {ShopContext} from '../context/ShopContext';
import {useContext} from 'react';

import {Link} from 'react-router-dom';


function ProductItem({_id,image,name,price,oldPrice}) {

const {currency} = useContext(ShopContext)

const hasDiscount = oldPrice > price;

const discountPercent = hasDiscount
      ? Math.round(((oldPrice - price) / oldPrice) * 100 ) : 0;
 


  return (
    <Link to = {`/product/${_id}`} className='text-center '>
     
     {/* -----Product Image----- */}

       <div className="overflow-hidden rounded-md">
          <img className = 'w-full  aspect-3/4 rounded-md object-cover  transition-transform hover:scale-105' src= {image } alt= {name} />
       </div>

       {/* -----Product Name------ */}

       <p className="pt-3 pb-1 text-sm font-semibold text-gray-800">{name}</p>

        {/* -----Price----- */}
       <div className='flex items-center justify-between gap-2'>

        <p className="flex text-md text-gray-900 ">{currency} {price}  </p>

        {/* Discount */}
         
         <div >

            {
               hasDiscount && (
                <div >

                     <p className="text-sm  text-gray-500 line-through"> 
                        {currency} {oldPrice}
                    </p>
                    
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

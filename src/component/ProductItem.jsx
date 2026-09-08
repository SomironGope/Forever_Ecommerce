import {ShopContext} from '../context/ShopContext';
import {useContext} from 'react';

import {Link} from 'react-router-dom';


function ProductItem({_id,image,name,price}) {

const {currency} = useContext(ShopContext)

  return (
    <Link to = {`/product/${_id}`} className='text-center '>
       <div className="overflow-hidden ">
          <img className = 'w-full  h-55 md:h-55 lg:h-65 rounded-md hover:scale-110 transition ease-in-out object-fill' src= {image } alt="" />
       </div>
       <p className="pt-3 pb-1 text-sm font-semibold text-gray-800">{name}</p>
       <p className="text-sm font-medium"> {price} {currency} </p>
    </Link>

  )
}

export default ProductItem;

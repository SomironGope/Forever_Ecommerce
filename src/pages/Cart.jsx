import { useContext,useMemo } from "react";
import {Link} from 'react-router-dom';
import {ShopContext} from '../context/ShopContext';
import Title from '../component/Title';
import { assets } from "../assets/products";
import CartTotal from "../component/CartTotal";



function Cart() {
   
    const {products,cartItems,currency,updateQuantity,navigate} = useContext (ShopContext);

    const cartData = useMemo (() => {
      const tempData = [];

      for( const productId in cartItems) {
         for(const size in cartItems[productId]) {
          if(cartItems[productId][size] > 0 ) {
            tempData.push({
              id:productId,
              size,
              quantity: cartItems[productId][size],

            });
          }
         }
      }
      return tempData;
    },[cartItems])

   

  return (
    <> {cartData.length > 0 ?  <div className="border-t pt-14">
      {/*  */}
      <div className="text-2xl mb-3">
        <Title text1 = {'YOUR'} text2 = {'CART'} />

      </div>
       <div>
           {
           cartData.map((item,index) => {
            const productData = products.find((product) => 
            product.id === Number(item.id));

            if(!productData) 
              return null;

            return (
              <div key={index} className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"> 
                <div className="flex items-start gap-6">
                  <img src= {productData.image[0]} alt = {productData.name} className = 'w-16 sm:w-20 rounded-sm' />
                  <div>
                       <p className="text-sm sm:tex-lg font-medium">{productData.name}</p>
                       <div className="flex items-center gap-5 mt-2">
                        <p>{currency} {productData.new_price}</p>
                        <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50 rounded">{item.size}</p>

                       </div>
                  </div>
                </div>
                <input onChange = {(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item.id, item.size,Number(e.target.value))} className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 outline-none rounded focus:border-sky-500" type="number" min = {1} defaultValue={item.quantity} />
                  <img onClick = {() => updateQuantity(item.id,item.size,0)} className="w-4 sm:w-5 cursor-pointer " src= {assets.binIcon} alt="" />
                </div>
            )
           })
           }
       </div>

        <div className="flex justify-end my-20">
           <div className="w-full sm:w-112.5">
             <CartTotal />
             <div className="w-full text-end">
               <button onClick={() => navigate('/place-order')} className="bg-black text-white text-sm my-8 px-8 py-3 cursor-pointer rounded-md">PROCEED TO CHECKOUT</button>
               
             </div>

           </div>

         </div>

      
    </div> 


    // Empty Cart //
    : <div className="text-center py-20 sm:py-35 items-center">
           <h2 className="text-2xl font-semibold">Your Cart is Empty</h2>
           <p className="mt-2 text-gray-500">Continue shopping and add some products.</p>
           <Link to = '/collection' className="inline-block mt-4 px-4 py-3 bg-black text-white rounded-md">Continue Shopping</Link>
           </div>}
   
    </>
  )
}

export default Cart;35
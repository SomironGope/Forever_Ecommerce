import { useContext, useMemo, useState} from "react";
import {ShopContext} from '../context/ShopContext';
import Title from '../component/Title';
import {assets} from '../assets/products';
import ProductItem from "../component/ProductItem";
function Collection() {
  const {products,search,showSearch} = useContext (ShopContext)
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState ([]);
  const [sortType, setSortType] = useState ('relevent')
  

  // Category ToggleHandler//

  const toggleCategory = (e) => {
    if(category.includes(e.target.value)){
      setCategory (prev => prev.filter(item => item !== e.target.value))
    }else {
      setCategory (prev => [...prev,e.target.value])
    }
  }

  // Sub Category TogggleHandler //

  const toggleSubCategory = (e) => {
    if(subCategory.includes(e.target.value)) {
      setSubCategory (prev => prev.filter(item => item !== e.target.value) );
    }else {
      setSubCategory (prev => [...prev, e.target.value]);
    }
  };


const filterProduct = useMemo(() => {
  let productCopy = [...products];

  if(category.length > 0) {
    productCopy = productCopy.filter((item) => category.includes (item.category));
  }

if(subCategory.length > 0) {
  productCopy = productCopy.filter((item) => subCategory.includes (item.subCategory));
}

if(search && showSearch) {
  productCopy = productCopy.filter ((item) => item.name.toLowerCase().includes(search.toLowerCase()))
}

productCopy.sort((a,b) => {
  if(sortType === "low-high"){
    return a.price - b.price
  }

  if(sortType === "high-low") {
    return b.price - a.price;
  }
  return 0;
})

return productCopy;

}, [products, category,subCategory,search,showSearch,sortType])


  


  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
       {/* Left Side */}
       {/* Filter Options */}
        <div className="min-w-60 ">
            <p onClick = {() => setShowFilter (!showFilter)} className="my-2 text-xl flex items-center cursor-pointer gap-2" >FILTERS 
              <img className= {`h-3  sm:hidden ${showFilter ? 'rotate-90': ''}`} src= {assets.dropdownarrow} alt="" />
            </p>
             
            {/* Category Filter */}
            <div  className= {`border-2  border-gray-300 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
               <p className="mb-3 text-sm font-medium px-2">CATEGORIES</p>
               <div className="px-2">
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Men'}   onChange={toggleCategory}/> Men
                  </p>
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Women'}  onChange={toggleCategory} />
                    Women
                  </p>
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Kids'}  onChange={toggleCategory} /> Kids
                  </p>
               </div>
            </div>

               {/* SubCategory Filter */}
             <div className= {`border-2  border-gray-300 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
               <p className="mb-3 text-sm font-medium px-2">TYPE</p>
               <div className="px-2">
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Topwear'}  onChange={toggleSubCategory}/> Topwear
                  </p>
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Bottomwear'} onChange={toggleSubCategory} />
                    Bottomwear 
                  </p>
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Winterwear'}  onChange={toggleSubCategory}/> Winterwear
                  </p>
               </div>
            </div>

            
            
        </div>
        {/* Right Side */}
        <div className="flex-1">
          <div className="flex justify-between text-sm sm:text-2xl mb-4">
                <Title text1 = {'All'} text2 = {'COLLECTIONS'}/>
                {/* Product Sort */}
                <select onChange = {(e) => setSortType (e.target.value)} className="border-2 border-gray-300 text-sm px-2 outline-none">
                   <option  value= "relevent" >Sort by: Relevent</option>
                   <option  value= "low-high" >Sort by: Low to High</option>
                   <option  value= "high-low" >Sort by: High to Low</option>
                </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 gap-y-6">
            {
              filterProduct.map((item) => (
                <ProductItem key={item._id} _id = {item._id} image = {item.productImg?.[0]?.url} name = {item.name} price={item.price} />
              ))
            }


          </div>

        
        </div>
    </div>
  )
}

export default Collection;
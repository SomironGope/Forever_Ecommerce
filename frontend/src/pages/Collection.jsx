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
  const [sortType, setSortType] = useState ('relevant');

  const [priceRange,setPriceRange] = useState ("");
  

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
 
  //-------------------------Search Filter----------------------

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

if (priceRange === "0-50") {
  productCopy = productCopy.filter ((item) => item.price >= 0 && item.price <= 50);
}

if (priceRange === "50-100") {
  productCopy = productCopy.filter ((item) => item.price > 50 && item.price <= 100);
}

if (priceRange === "100-200") {
  productCopy = productCopy.filter ((item) => item.price > 100 && item.price <= 200);
}

if (priceRange === "200+") {
  productCopy = productCopy.filter ((item) => item.price > 200);
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

}, [products, category,subCategory,search,showSearch,sortType, priceRange])


  


  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10">
       {/* Left Side */}
       {/* Filter Options */}
        <div className="min-w-60 ">
            <p onClick = {() => setShowFilter (!showFilter)} className="my-2 text-xl flex items-center cursor-pointer gap-2" >FILTERS 
              <img className= {`h-3  sm:hidden ${showFilter ? 'rotate-90': ''}`} src= {assets.dropdownarrow} alt="" />
            </p>

            <button onClick = {() => {
              setCategory ([]); 
              setSubCategory ([]);
              setPriceRange ("");
              setSortType ("relevant");
            }}
               className="mt-3 text-sm font-semibold tracking-wider text-red-500 underline">Clear Filters</button>
             
            {/* -------------------Category Filter------------------ */}
            <div  className= {`border-2  border-gray-300 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
               <p className="mb-3 text-sm font-medium px-2">CATEGORIES</p>
               <div className="px-2">
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Men'} checked = {category.includes("Men")}  onChange={toggleCategory}/> Men
                  </p>
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Women'} checked = {category.includes ("Women")} onChange={toggleCategory} />
                    Women
                  </p>
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Kids'} checked = {category.includes ("Kids")} onChange={toggleCategory} /> Kids
                  </p>
               </div>
            </div>

               {/*------------------ SubCategory Filter---------------- */}
             <div className= {`border-2  border-gray-300 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
               <p className="mb-3 text-sm font-medium px-2">TYPE</p>
               <div className="px-2">
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Topwear'} checked = {subCategory.includes ("Topwear")}  onChange={toggleSubCategory}/> Topwear
                  </p>
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Bottomwear'} checked = {subCategory.includes ("Bottomwear")} onChange={toggleSubCategory} />
                    Bottomwear 
                  </p>
                  <p className="flex gap-2">
                    <input className="w-3 " type="checkbox" value={'Winterwear'} checked = {subCategory.includes ("Winterwear")}  onChange={toggleSubCategory}/> Winterwear
                  </p>
               </div>
            </div>

            {/* -------------------------Price Range Filter---------------- */}

            <div className= {`border-2 border-gray-300 py-3 mt-6 ${showFilter ? "" : "hidden"} sm:block`} >
                  
                  <p className="mb-3 text-sm font-medium pl-2 tracking-widest">PRICE RANGES</p>

                  <div>
                     <p className="flex gap-2 pl-2">
                         <input className="w-3 " type="radio"
                          name="priceRange"
                          value = "0-50" 
                         checked = {priceRange === "0-50"}
                         onChange={(e) => setPriceRange (e.target.value)} /> 0 - 50 SAR
                     </p>

                     <p className="flex gap-2 pl-2">
                       <input className="w-3" type="radio"
                        name="priceRange" 
                        value= "50-100"
                         checked = {priceRange === "50-100"}
                         onChange={(e) => setPriceRange (e.target.value)} /> 50 - 100 SAR
                     </p>

                     <p className="flex gap-2 pl-2">
                         <input className="w-3" 
                         type="radio"
                         name="priceRange"
                         value= "100-200"
                         checked = {priceRange === "100-200"}
                         onChange={(e) => setPriceRange (e.target.value)} /> 100 - 200 SAR
                         </p>

                         <p className="flex gap-2 pl-2">
                            <input className="w-3"
                             type="radio"
                             name="priceRange"
                             value= "200+"
                             checked = {priceRange === "200+"}
                             onChange={(e) => setPriceRange (e.target.value)} /> 200 + SAR 
                         </p>
                  </div>
              
                
            </div>
            
        </div> 
        {/* --------------------Right Side-------------------------- */}
        <div className="flex-1">
          <div className="flex justify-between text-sm sm:text-2xl mb-4">
                <Title text1 = {'All'} text2 = {'COLLECTIONS'}/>
                {/* ---------------Product Sort -------------------------*/}
                <select onChange = {(e) => setSortType (e.target.value)} className="border-2 border-gray-300 text-sm px-2 outline-none">
                   <option  value= "relevent" >Sort by: Relevant</option>
                   <option  value= "low-high" >Sort by: Low to High</option>
                   <option  value= "high-low" >Sort by: High to Low</option>
                </select>
          </div>
            {/* --------------Product Count------------- */}
           <p className="text-sm text-gray-500 mb-4">Showing {filterProduct.length} products</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-6">
           

             {
             filterProduct.length === 0 ? (
              <div className="col-span-full text-center py-16">
                 <p className="text-lg text-gray-500">No products found</p>

                 <p className="text-sm text-gray-400 mt-2"> Try changing your search or filters.</p>
              </div>
             )
             : (
              filterProduct.map((item) => (
                <ProductItem key={item._id} 
                _id = {item._id} 
                image = {item.productImg?.[0]?.url} 
                name = {item.name} 
                oldPrice = {item.oldPrice} 
                price={item.price} />
              ))
             )
           }
           
           
            
              
            


          </div>

        
        </div>
    </div>
  )
}

export default Collection;
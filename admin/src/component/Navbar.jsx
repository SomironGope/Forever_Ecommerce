


function Navbar({logout}) {
   
 
  return (
   <div className="w-full fixed top-0 overflow-hidden bg-linear-to-r from-pink-500 to-violet-500 items-center justify-center p-5  shadow-lg shadow-gray-400 " >
              <div className="w-full h-auto sm:px-6 md:px-8 lg:px-10 xl:px-14 flex  items-center justify-between text-center">
                  
                  
                   <div className="flex flex-col h-auto">
                      <h1 className="text-md sm:text-base md:text-lg lg:text-2xl text-white font-semibold tracking-widest">Forever Ecommerce</h1>
                      <p className="inline-block text-white text-md font-bold ">SG</p>
                  </div> 
                  <h1 className="text-md sm:text-base md:text-lg lg:text-2xl font-semibold text-white mb-3 tracking-wider">ADMIN PANEL</h1>

                  <button onClick={logout} className="border text-sm sm:text-base font-semibold cursor-pointer px-2 py-1 sm:px-4 sm:py-1.5 lg:px-5 lg:py-2 mb-3 rounded-3xl bg-linear-to-r from-orange-500 to-violet-500 hover:bg-linear-to-r hover:from-pink-500 hover:to-sky-500">LOGOUT</button>
               </div>
              
               

   </div>
  )
}

export default Navbar;
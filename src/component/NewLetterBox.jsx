

function NewLetterBox() {

   const onSubmitHandler = (e) => {
    e.preventDefault()
   };


  return (
    <div className="my-5 text-center">
       
           <p className="text-2xl font-medium text-gray-800">Subscribe now & get 20% off</p>
           <p className="text-gray-400 mt-3">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
           </p>
           <form onSubmit = {onSubmitHandler} className=" sm:flex sm:items-center sm:justify-center sm:gap-x-2">
              <input className = 'text-[11px] px-2 py-1 w-full sm:w-1/2 flex items-center gap-3 my-6 border pl-3 outline-none rounded-sm focus:border-sky-600' type="text" placeholder="Enter your email" />
            <button type="submit" className=" bg-black text-white text-xs px-10 py-2 hover:transition-all hover:ease-in-out hover:duration-200 uppercase rounded-md hover:bg-pink-800 hover:cursor-pointer ">Subscribe</button>
           
           </form>

    </div>
  )
}

export default NewLetterBox;
import { useState } from "react";


function Login() {

    const [currentState,setCurrentState] = useState ('Login');

    const submitHandler = (e) => {
      e.preventDefault()
    };

  return (
    <form onSubmit = {submitHandler} className="flex flex-col items-center w-[90%] sm:max-96 m-auto mt-14 gap-4 text-gray-800">
         <div className="inline-flex items-center gap-2 mb-2 mt-10">
           <p className="prata-regular text-3xl">{currentState}</p>
           <hr className="border-none h-[1.5px] w-8 bg-gray-800"/> 
         </div>


         {currentState === 'Login' ? '' : <input className="w-full px-3 py-2 sm:w-100 text-sm border border-gray-600 rounded-sm outline-none" type="text" placeholder="Name" /> }
          
           <input className="w-full px-3 py-2 sm:w-100 text-sm border border-gray-600 rounded-sm outline-none" type="email" placeholder="Email" />
            <input className="w-full px-3  py-2 sm:w-100 text-sm border border-gray-600 rounded-sm outline-none" type="password" placeholder="Password" />
            <div className="w-full flex justify-between text-[11px] sm:text-sm mt-2 sm:w-100">

               <p className="shrink-0">You don't have an account?
                {currentState === 'Login' ?

                <p onClick={() => setCurrentState ('Sign Up')} className="cursor-pointer hover:text-sky-900">Sign Up</p>
                 :
                 <p  onClick={() => setCurrentState ('Login')}className="cursor-pointer hover:text-sky-900">Login</p>} </p>
              
              {currentState === 'Login' ?  <p className=" cursor-pointer hover:text-sky-900">Forgot your password</p> : ''}
            </div>
            <button type="submit" className="text-sm px-8 py-2 mt-5 bg-black text-white rounded-sm cursor-pointer transition-all ease-in-out duration-300 hover:bg-pink-500 hover:text-gray-800">
              {currentState === 'Login' ? 'LOGIN' : 'SUBMIT'}
              </button>
    </form>
  )
}

export default Login;
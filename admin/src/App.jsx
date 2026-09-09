
import './App.css'
import Navbar from './component/Navbar'
import {Routes, Route, Navigate} from 'react-router-dom';
import Sidebar from './component/Sidebar'
import List from './pages/List'
import Order from './pages/Orders';
import Login from './component/Login';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Add from './pages/Add';



function App () {
 
   

  const [token, setToken] = useState(localStorage.getItem('adminToken') || "" );

  useEffect(() => {

    if(token) {
      localStorage.setItem('adminToken', token)
    }
    
  },[token]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
    
  
  };



  return (
    <div className='bg-gray-50 min-h-screen '>

      {token === "" ? (<Login setToken = {setToken} /> ) 
      :
       <>
       <ToastContainer />
          <Navbar logout = {logout} />
         
        <div className='flex w-full mt-25'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                  
                  <Route path='/' element = {< Navigate to = "/add" /> }/>
                  <Route path='/add' element = { <Add />} />
                  <Route path='/list' element = { <List /> } />
                  <Route path='/orders' element = {<Order />} />
                  
              </Routes>
            </div>
        </div>
       </>
        
      }
      
        
        
     
        
      
     
  </div>

  )
     
  
 
}

export default App

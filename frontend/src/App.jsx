
import './App.css'
import { Routes, Route} from 'react-router-dom';
import Navbar from './components/Navber';
import Footer from './components/Footer';
import Home from './pages/Home';
import Collection from './pages/Collection'; 
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Cart from './pages/Cart';
import PlaceOrder from './pages/PlaceOrder';
import NotFound from './components/NotFound';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SearchBar from './components/SearchBar';

import Orders from './pages/Orders';
import Signup from './pages/Signup';

import Verify from './components/Verify';
import OrderTracking from './pages/OrderTracking';
import OTPVerify from './pages/OTPVerify';
import Change_Password from './pages/Change_Password';
import Forgot_Password from './pages/Forgot_Password';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentCancel from './pages/PaymentCancel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




function App() {
  

  return (
    <div className='min-h-screen'>
        <ToastContainer />
        <Navbar />

        <div className = 'p-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] xl:px-[12vw]'>

       
        <SearchBar />
        <Routes >
           <Route path = '/' element = {<Home />} />

           <Route path = '/collection' element = {<Collection />} />

           <Route path = '/about' element = {<About />} />

           <Route path = '/contact' element = {<Contact />} />

           <Route path = '/product/:productId' element = {<Product/>} />

           <Route path = '/cart' element = {<Cart/>} />

           <Route path='/payment/success' element = { <PaymentSuccess />} />
           
           <Route path='/payment/failed' element = { <PaymentFailed />} />

           <Route path='/payment/cancel' element = { <PaymentCancel  />} />
          
           <Route path = '/place-order' element = {<PlaceOrder />} />

           <Route path='/order/:orderId' element = {<OrderTracking />} />
 
           <Route path = '/profile' element = {<Profile />} />

           <Route path='/signup' element = {<Signup />} />

           <Route path='/verify' element = {<Verify />} />

           <Route path='/forgot-password' element = {<Forgot_Password />} />
           
           <Route path= '/forgot-password/verify-otp/:email'  element = { <OTPVerify />} />

           <Route path='/forgot-password/change-password/:email' element = {<Change_Password/>}  />

           <Route path = '/orders' element = {<Orders />} />

           <Route path='/login' element = {<Login />} />

           <Route path = '*' element = {<NotFound/>} />
    
        </Routes>

         </div>
        <Footer />
     
    </div>
  )
}


export default App

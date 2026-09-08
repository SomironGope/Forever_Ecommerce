
import './App.css'
import { Routes, Route} from 'react-router-dom';
import Navbar from './component/Navber';
import Footer from './component/Footer';
import Home from './pages/Home';
import Collection from './pages/Collection'; 
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Cart from './pages/Cart';
import PlaceOrder from './pages/PlaceOrder';
import NotFound from './component/NotFound';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SearchBar from './component/SearchBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Orders from './pages/Orders';
import Signup from './pages/Signup';
import ForgotPassword from './pages/forgotPassword';
import Verify from './component/verify';
import OrderTracking from './pages/OrderTracking';



function App() {
  

  return (
    <div className = ' p-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] xl:px-[12vw]'>
        <ToastContainer />
        <Navbar />
        <SearchBar />
        <Routes >
           <Route path = '/' element = {<Home />} />
           <Route path = '/collection' element = {<Collection />} />
           <Route path = '/about' element = {<About />} />
           <Route path = '/contact' element = {<Contact />} />
           <Route path = '/product/:productId' element = {<Product/>} />
           <Route path = '/cart' element = {<Cart/>} />
           <Route path = '/place-order' element = {<PlaceOrder />} />
           <Route path='/order/:orderId' element = {<OrderTracking />} />
           <Route path = '/profile' element = {<Profile />} />
           <Route path='/signup' element = {<Signup />} />
           <Route path='/verify' element = {<Verify />} />
           <Route path='forgot-password' element = { <ForgotPassword />} />
           <Route path = '/orders' element = {<Orders />} />
           <Route path='/login' element = {<Login />} />
           <Route path = '*' element = {<NotFound/>} />
        </Routes>
        <Footer />
     
    </div>
  )
}


export default App

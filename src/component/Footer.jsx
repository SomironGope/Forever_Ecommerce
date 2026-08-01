import { Link } from "react-router-dom";

function Footer() {
  return (
    <div>
       <div className="flex flex-col sm:grid sm:grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-gray-600 ">
          <div>
            <Link to="/">
                    <h2 className="text-2xl font-medium text-gray-700">Forever</h2>
            </Link> 
            <p className="w-full md:w-2/3 text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia consequatur sapiente aperiam quam vero voluptatem illo illum id voluptates asperiores.</p>
          </div>

          <div>
             <p className="text-xl font-medium mb-5 text-gray-800">COMPANY</p>
             <ul className="flex flex-col gap-1 text-gray-600">
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy Policy</li>
             </ul>
          </div>
          <div>
             <p className="text-xl font-medium mb-5 text-gray-800">GET IN TOUCH</p>
             <ul className="flex flex-col gap-1 text-gray-600">
               <li>+996123-456-789</li>
               <li>contact@support.com</li>
             </ul>
          </div>
          
       </div>
       <div>
             <hr/>
             <p className="text-[11px] text-gray-600 text-center py-1 sm:text-sm  sm:py-1.5">Copyright @ {new Date().getFullYear()} forever.com - All Right Reserved</p>
          </div>
    </div>
  )
}

export default Footer;
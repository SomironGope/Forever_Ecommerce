import { Link } from "react-router-dom";
// -------------------Socials Icons---------------
import { FaFacebook } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";


function Footer() {
  return (
    <div className="px-4">
      <div className="flex flex-col sm:grid sm:grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-gray-600 ">
        <div>
          {/* -------------------Brand-------------------- */}
          <Link to="/">
            <h2 className="text-2xl font-medium text-gray-700">Forever</h2>
          </Link>

          <p className="w-full md:w-2/3 text-gray-600">
            Forever is your destination for quality fashion and everyday
            essentials. We bring you carefully selected styles with a simple and
            enjoyable shopping experience.
          </p>
        </div>

        {/* ---------------------Company-------------------- */}

        <div>
          <p className="text-xl font-medium mb-5 text-gray-800">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About us</Link>
            </li>
          </ul>
        </div>

        {/* -----------------------Contact--------------------*/}
        <div>
          <p className="text-xl font-medium mb-5 text-gray-800">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+996546-972-819</li>
            <li>somirongope466@gmail.com</li>
            <div className="flex items-start justify-start gap-2 mt-2">
                <a href="https://www.facebook.com/share/1JsiE46bZz/?mibextid=wwXIfr"><FaFacebook className="w-5 h-5 hover:bg-blue-600 hover:rounded-full transition-all"/></a>
                <a href="https://wa.me/message/WDWEWNIUDPXOG1"><FaWhatsapp className="w-5 h-5 hover:bg-blue-600 hover:rounded-full transition-all " /></a>
                <a href="https://www.instagram.com/somiron.webdev?vrfl=MTY4ZGhkNDd5OGJ5cg%3D%3D&utm_source=qr"><FaSquareInstagram className="w-5 h-5 hover:bg-blue-600 hover:rounded-full transition-all " /></a>
            </div>
            
          </ul>
        </div>
      </div>

      {/* --------------------------Copyright---------------------- */}
      <div>
        <hr />
        <p className="text-[11px] text-gray-600 text-center py-1 sm:text-sm  sm:py-1.5">
          Copyright @ {new Date().getFullYear()} forever. All Right Reserved
        </p>
      </div>
    </div>
  );
}

export default Footer;

import { useEffect, useState } from "react";
import api from '../utils/axiosInstance';
import {Link}  from 'react-router-dom';
import {ChevronLeft, ChevronRight} from 'lucide-react';

function Banner() {

  const [banners, setBanners] = useState ([]);
  const [currentIndex, setCurrentIndex] = useState (0);
  const [loading, setLoading] = useState (true);
  const [isPause, setIsPause] = useState (false);

  // --------------Fetch active Banner---------------

  useEffect (() => {

    const fetchBanner = async () => {
      try {
        setLoading(true);

        const response = await api.get ("/api/v1/banner/all-banner");

        if (response.data.success) {
          setBanners (response.data.banners);
        }
      } catch (error) {
        console.error ("Failed to fetche banners:", error)
      }finally{
        setLoading(false)
      }
    }
    fetchBanner()
  },[])


  // ---------------Automatic slider------------

  useEffect (() => {
    if (banners.length <= 1 || isPause) return;

    const interval = setInterval (() => {
      setCurrentIndex ((prev) => 
      (prev + 1 ) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  },[banners.length, isPause]);


  // ---------------------Previous Slide Button-----------------

  const preSlide = () => {
    setCurrentIndex ((prev) => prev === 0 ? banners.length -1 : prev - 1);
  };

  // ----------------------Next Slide Button--------------------

  const nextSlide = () => {
    setCurrentIndex ((prev) => (prev + 1 ) % banners.length);
  };


   if (loading || banners.length === 0 ) return null;

   const banner = banners[currentIndex];



return (
  <section
    className="relative w-full overflow-hidden"
    onMouseEnter={() => setIsPause(true)}
    onMouseLeave={() => setIsPause(false)}
  >
    {/* Banner Image Container */}
    <div className="relative w-full h-85 sm:h-110 lg:h-140 xl:h-155">

      {/* Background Image */}
      <img
        src={banner.image}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none">

        {/* Banner Content */}
        <div className="relative flex h-full flex-col justify-center  ml-8 px-8 sm:px-14 md:px-20 lg:px-24 pointer-events-none">

          <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white max-w-xl leading-tight">
            {banner.title}
          </h2>

          <p className="mt-3 sm:mt-5 text-sm sm:text-base lg:text-lg text-white max-w-md leading-relaxed">
            {banner.subTitle}
          </p>

          {/* Shop Button */}
          <Link
            to={banner.link || "/collection"}
            className="pointer-events-auto mt-6  sm:mt-8 w-fit bg-white text-black px-5 sm:px-8 py-3 text-sm sm:text-base rounded-sm hover:bg-gray-200 transition-colors"
          >
            {banner.buttonText || "Shop Now"}
          </Link>

        </div>
      </div>

      {/* Previous & Next Buttons */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={preSlide}
            aria-label="Previous banner"
            className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow-md"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next banner"
            className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow-md"
          >
            <ChevronRight size={22} />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">

            {banners.map((item, index) => (
              <button
                key={item._id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to banner ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "w-7 bg-white"
                    : "w-2 bg-white/60"
                }`}
              />
            ))}

          </div>
        </>
      )}

    </div>
  </section>
);

}

export default Banner;
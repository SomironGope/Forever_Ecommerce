import { assets } from "../assets/products";

function OurPolicy() {
  return (
    <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-sm sm:text-sm md:text-base text-gray-700" >
        <div>
          <img className='w-12 m-auto mb-5' src= {assets.exchange} alt='' />
          <p className='font-semibold'>Easy Exchange Policy</p>
          <p className='text-gray-600'>We offer hassle free exchange policy</p>
        </div>
         <div>
          <img className='w-12 m-auto mb-5' src= {assets.quantity} alt='' />
          <p className='font-semibold'>7 days Return Policy</p>
          <p className='text-gray-600'>We provide 7 days free return policy</p>
        </div>
         <div>
          <img className='w-12 m-auto mb-5' src= {assets.support} alt='' />
          <p className='font-semibold'>Best customer support</p>
          <p className='text-gray-600'>We provide 24/7 customer support</p>
        </div>
        <div>
          <img className='w-12 m-auto mb-5' src= {assets.secure} alt='' />
          <p className='font-semibold'>Best secure online</p>
          <p className='text-gray-600'>We provide best secure online payment</p>
        </div>
    </div>
  )
}

export default OurPolicy;
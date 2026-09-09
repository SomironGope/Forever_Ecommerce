import addImg from '../assets/add.png';
import listImg from '../assets/checklist.png';
import orderImg from '../assets/booking.png';


import {NavLink} from 'react-router-dom'
function Sidebar() {
  return (
    <div className='w-[18%] min-h-screen border-r-2 border-gray-400 '>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15p] mr-2'>
             <NavLink to = '/add'  className= "flex items-center gap-3 border border-gray-300 px-3 object-fill py-1 rounded-md hover:opacity-55">
               <img src={addImg} alt='addImg' className='w-5' />
               <p className='hidden md:block'>Add Items</p>
             </NavLink>

             <NavLink to = '/list'  className= "flex items-center gap-3 border border-gray-300 px-3 object-fill py-1 rounded-md hover:opacity-55">
               <img src={listImg} alt='addImg' className='w-5' />
               <p className='hidden md:block'>List Items</p>
             </NavLink>

             <NavLink to = '/orders'  className= "flex items-center gap-3 border border-gray-300 px-3 object-fill py-1 rounded-md hover:opacity-55">
               <img src={orderImg} alt='addImg' className='w-5' />
               <p className='hidden md:block'>Orders Items</p>
             </NavLink>
        </div>
    </div>
  )
}

export default Sidebar
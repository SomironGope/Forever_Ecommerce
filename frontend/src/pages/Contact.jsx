import {Mail, Phone, MapPin, Clock, Send} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toast";
import Title from '../components/Title';

function Contact() {

  const [formData, setFormData] = useState ({
    name: '',
    email: '',
    subject: '',
    message: '',
  });


  const handleChange = (e) => {
    const {name, value} = e.target;

    setFormData ((prev) => ({
      ...prev,
      [name] : value,
    }
     
    ));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    toast.info("Contact form UI is ready. Email submission is not connected yet.");

  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      detail: "somirongope466@gmail.com"
    },
    {
      icon: Phone,
      title: "Call Us",
      detail: "+996546972819",
    },
    {
      icon: MapPin,
      title: "Our Location",
      detail: "Saudi Arbia",
    },
    {
      icon: Clock,
      title: "Working Hours",
      detail: "Sunday-Thusday",
    }
  ]

  return (
    <main className="px-4 sm:px-8 md:px-12 lg:px-20 py-10 md:py-16">

        {/* -------------------------Page Heading------------------------- */}
           <div className="text-center mb-12"> 
               <Title text1={"CONTACT"} text2={"US"}/>

               
                   <p className='text-gray-500 text-sm md:text-base max-w-xl mx-auto'>
                     Have a question about our collection or your order?
                     We are here to help. Send us a message and our team will be happy to assist you.
                   </p>
               
           </div>
          {/* ----------------------Contact Content------------------------ */}

           <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 max-w-6xl mx-auto'>
               <section>
                    <h2 className='text-xl font-medium mb-3'>Get In Touch</h2>

                    <p className='text-sm text-gray-500 leading-6 mb-8'>
                      Whether you need help with an order, product information, delivery, or returns feel free to contact us.
                    </p>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                        {
                          contactInfo.map((item) => {
                            const Icon = item.icon;

                            return (
                              <div key = {item.title} className="flex items-start gap-2">

                                 <div className="border border-gray-400 rounded p-3">
                                    <Icon size={21}
                                       strokeWidth={1.5}
                                       />
                                  </div>

                                  <div>
                                      <h3 className="text-sm font-medium mb-1">
                                          {item.title}
                                      </h3>
                                      <p className="text-sm text-gray-500 wrap-break-word">
                                         {item.detail}
                                      </p>
                                    </div>
                                </div>
                            )
                          })
                        }

                    </div>

                    <div className="mt-10 bg-gray-400 p-6 rounded-md">
                         <h3 className="font-medium mb-2"> We are here for you</h3>
                         
                         <p className="text-sm text-gray-700 leading-6 tracking-wide:">
                            Your satisfaction matters to us. Contact our team for assistance with your shopping experience at Forever.
                         </p>
                    </div>
               </section>

               {/* ------------------------------Contact Form------------------------- */}

               <section>
                    <h2 className="text-xl font-medium mb-6">Send Us a message</h2>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm mb-2">Full Name</label>
                            <input type="text"
                             id="name"
                             name="name"
                             autoComplete="name"
                             value={formData.name}
                             onChange={handleChange}
                             placeholder="Enter your full name"
                             className="w-full border border-gray-400 rounded-md px-4 py-3 text-sm outline-none focus:border-sky-600"
                             />

                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm mb-2">Email Address</label>
                            <input type="email"
                             id="email"
                             name="email"
                             autoComplete="email"
                             value={formData.email}
                             onChange={handleChange}
                             placeholder="Enter your email"
                             className="w-full border border-gray-400 rounded-md px-4 py-3 text-sm outline-none focus:border-sky-600"
                             />
                             
                        </div>
                         <div>
                            <label htmlFor="subject" className="block text-sm mb-2">Subject</label>
                            <input type="text"
                             id="subject"
                             name="subject"
                             autoComplete="subject"
                             value={formData.subject}
                             onChange={handleChange}
                             placeholder="How can we help?"
                             className="w-full border border-gray-400 rounded-md px-4 py-3 text-sm outline-none focus:border-sky-600"
                             />
                             
                        </div>

                        <div>
                            <label htmlFor= "message" className="block text-sm mb-2">Message</label>
                            
                            <textarea type="text"
                              name="message"
                              id="message"
                              row = "5"
                              required
                              value={formData.message}
                              onChange={handleChange}
                              placeholder="Write your message here..."
                              className="w-full border border-gray-400 rounded-md px-3 py-3 text-sm outline-none focus:border-sky-600 resize-y "
                              />
                        </div>
                        
                        <button type="submit"
                          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 mt-2 outline-none text-sm hover:bg-gray-800 transition-colors rounded-md">
                            <Send
                             size={16}
                             />
                             Send Messsage

                          </button>
                          
                    </form>
               </section>
           </div>
      </main>
  )
}

export default Contact;
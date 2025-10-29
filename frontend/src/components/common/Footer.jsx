// frontend/src/components/common/Footer.jsx
import React from 'react';

const Footer = () => {
   return (
      <footer className="bg-gray-800 text-white mt-12">
         <div className="container mx-auto px-4 py-8">

            {/* Use flex instead of grid */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">

               {/* Left side */}
               <div className="mb-6 md:mb-0">
                  <h3 className="text-xl font-bold mb-4">Zwiggy</h3>
                  <p className="text-gray-400 text-sm">
                     A distributed food delivery platform demonstrating key distributed systems concepts.
                  </p>
               </div>

               {/* Right side (Quick Links) aligned to right */}
               <div className="text-left md:text-right">
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                     <li><a href="/" className="hover:text-white">Home</a></li>
                     <li><a href="/orders" className="hover:text-white">Orders</a></li>
                     <li><a href="/distributed" className="hover:text-white">Distributed Dashboard</a></li>
                  </ul>
               </div>

            </div>
            
         </div>
      </footer>

   );
};

export default Footer;
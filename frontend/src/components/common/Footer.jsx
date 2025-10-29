// frontend/src/components/common/Footer.jsx
import React from 'react';

const Footer = () => {
   return (
      <footer className="bg-gray-800 text-white mt-12">
         <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div>
                  <h3 className="text-xl font-bold mb-4">FoodDistro</h3>
                  <p className="text-gray-400 text-sm">
                     A distributed food delivery platform demonstrating key distributed systems concepts.
                  </p>
               </div>

               <div>
                  <h4 className="font-semibold mb-4">Distributed Concepts</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                     <li>• Leader Election (Bully Algorithm)</li>
                     <li>• Lamport Clock Synchronization</li>
                     <li>• Consistency Models</li>
                     <li>• Load Balancing</li>
                     <li>• Data Replication</li>
                     <li>• MapReduce Analytics</li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                     <li><a href="/" className="hover:text-white">Home</a></li>
                     <li><a href="/orders" className="hover:text-white">Orders</a></li>
                     <li><a href="/distributed" className="hover:text-white">Distributed Dashboard</a></li>
                  </ul>
               </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
               <p>© 2025 FoodDistro - Distributed Systems Project</p>
            </div>
         </div>
      </footer>
   );
};

export default Footer;
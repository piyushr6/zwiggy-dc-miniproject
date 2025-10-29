// frontend/src/components/common/Loader.jsx
import React from 'react';

const Loader = ({ text = 'Loading...', size = 'medium', fullScreen = false }) => {
   const sizeClasses = {
      small: 'w-8 h-8',
      medium: 'w-16 h-16',
      large: 'w-24 h-24'
   };

   const spinnerSize = sizeClasses[size] || sizeClasses.medium;

   const content = (
      <div className="flex flex-col items-center justify-center p-8">
         <div className={`${spinnerSize} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
         <p className="mt-4 text-gray-600 font-medium">{text}</p>
      </div>
   );

   if (fullScreen) {
      return (
         <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            {content}
         </div>
      );
   }

   return content;
};

export default Loader;
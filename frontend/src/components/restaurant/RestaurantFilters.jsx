// frontend/src/components/restaurant/RestaurantFilters.jsx
import React, { useState } from 'react';

const RestaurantFilters = ({ onFilterChange }) => {
   const [filters, setFilters] = useState({
      cuisine: '',
      rating: '',
      sortBy: 'rating'
   });

   const handleFilterChange = (key, value) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFilterChange(newFilters);
   };

   const cuisines = ['All', 'Indian', 'Chinese', 'Italian', 'Mexican', 'Japanese', 'American'];
   const ratings = ['All', '4+', '4.5+'];
   const sortOptions = [
      { value: 'rating', label: 'Rating' },
      { value: 'deliveryTime', label: 'Delivery Time' },
      { value: 'minOrder', label: 'Min Order' }
   ];

   return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cuisine Filter */}
            <div>
               <label className="block text-sm font-semibold mb-2">Cuisine</label>
               <select
                  value={filters.cuisine}
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                  {cuisines.map(cuisine => (
                     <option key={cuisine} value={cuisine === 'All' ? '' : cuisine}>
                        {cuisine}
                     </option>
                  ))}
               </select>
            </div>

            {/* Rating Filter */}
            <div>
               <label className="block text-sm font-semibold mb-2">Minimum Rating</label>
               <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                  {ratings.map(rating => (
                     <option key={rating} value={rating === 'All' ? '' : rating}>
                        {rating}
                     </option>
                  ))}
               </select>
            </div>

            {/* Sort By */}
            <div>
               <label className="block text-sm font-semibold mb-2">Sort By</label>
               <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                  {sortOptions.map(option => (
                     <option key={option.value} value={option.value}>
                        {option.label}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {/* Active Filters Display */}
         {(filters.cuisine || filters.rating) && (
            <div className="mt-4 flex items-center gap-2">
               <span className="text-sm text-gray-600">Active filters:</span>
               {filters.cuisine && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                     {filters.cuisine}
                  </span>
               )}
               {filters.rating && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                     Rating {filters.rating}
                  </span>
               )}
               <button
                  onClick={() => {
                     setFilters({ cuisine: '', rating: '', sortBy: 'rating' });
                     onFilterChange({ cuisine: '', rating: '', sortBy: 'rating' });
                  }}
                  className="text-xs text-red-600 hover:text-red-800 ml-2"
               >
                  Clear all
               </button>
            </div>
         )}
      </div>
   );
};

export default RestaurantFilters;
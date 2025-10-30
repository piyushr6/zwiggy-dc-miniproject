// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import RestaurantFilters from '../components/restaurant/RestaurantFilters';
import Loader from '../components/common/Loader';
import restaurantService from '../services/restaurantService';

const HomePage = () => {
   const [restaurants, setRestaurants] = useState([]);
   const [filteredRestaurants, setFilteredRestaurants] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');

   useEffect(() => {
      fetchRestaurants();
   }, []);

   const fetchRestaurants = async () => {
      try {
         setLoading(true);
         const result = await restaurantService.getRestaurants();

         const data = result?.data || [];   // ✅ Prevent undefined
         setRestaurants(data);
         setFilteredRestaurants(data);
      } catch (err) {
         setError('Failed to load restaurants');
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleFilterChange = (filters) => {
      let filtered = [...restaurants];

      if (filters.cuisine) {
         filtered = filtered.filter(
            r => r?.cuisine?.toLowerCase() === filters.cuisine.toLowerCase()
         );
      }

      if (filters.rating) {
         const minRating = parseFloat(filters.rating);
         filtered = filtered.filter(r => (r?.rating || 0) >= minRating);
      }

      if (filters.sortBy) {
         filtered.sort((a, b) => {
            if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (filters.sortBy === 'deliveryTime') return (a.deliveryTime || 0) - (b.deliveryTime || 0);
            if (filters.sortBy === 'minOrder') return (a.minOrder || 0) - (b.minOrder || 0);
            return 0;
         });
      }

      setFilteredRestaurants(filtered);
   };

   const handleSearch = (query) => {
      setSearchQuery(query);

      if (!query.trim()) {
         setFilteredRestaurants(restaurants);
         return;
      }

      const searched = restaurants.filter(r =>
         r?.name?.toLowerCase().includes(query.toLowerCase()) ||
         r?.cuisine?.toLowerCase().includes(query.toLowerCase())
      );

      setFilteredRestaurants(searched);
   };

   if (loading) return <Loader text="Loading restaurants..." />;

   if (error) {
      return (
         <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
            <button
               onClick={fetchRestaurants}
               className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
               Retry
            </button>
         </div>
      );
   }

   return (
      <div>
         <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 mb-8 rounded-lg">
            <div className="text-center">
               <h1 className="text-4xl font-bold mb-4">Distributed Food Delivery</h1>
               <p className="text-lg mb-6">
                  Experience distributed systems concepts through food delivery
               </p>
               <div className="max-w-2xl mx-auto">
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => handleSearch(e.target.value)}
                     placeholder="Search restaurants or cuisines..."
                     className="w-full px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
               </div>
            </div>
         </div>

         <RestaurantFilters onFilterChange={handleFilterChange} />

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
               <p className="text-3xl font-bold text-blue-600">
                  {restaurants?.length || 0}
               </p>
               <p className="text-gray-600">Restaurants</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
               <p className="text-3xl font-bold text-green-600">
                  {restaurants?.filter(r => r?.isOpen)?.length || 0}
               </p>
               <p className="text-gray-600">Open Now</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
               <p className="text-3xl font-bold text-purple-600">3</p>
               <p className="text-gray-600">Active Nodes</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants?.map(restaurant => (
               <RestaurantCard
                  key={restaurant?.restaurant_id}
                  restaurant={restaurant}
               />
            ))}
         </div>

         {filteredRestaurants?.length === 0 && (
            <div className="text-center py-12">
               <p className="text-gray-500 text-lg">No restaurants found</p>
            </div>
         )}
      </div>
   );
};

export default HomePage;

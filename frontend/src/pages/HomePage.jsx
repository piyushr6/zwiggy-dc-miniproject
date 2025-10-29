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
         const data = await restaurantService.getRestaurants();
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

      // Filter by cuisine
      if (filters.cuisine) {
         filtered = filtered.filter(r => r.cuisine === filters.cuisine);
      }

      // Filter by rating
      if (filters.rating) {
         const minRating = parseFloat(filters.rating);
         filtered = filtered.filter(r => r.rating >= minRating);
      }

      // Sort
      if (filters.sortBy) {
         filtered.sort((a, b) => {
            if (filters.sortBy === 'rating') return b.rating - a.rating;
            if (filters.sortBy === 'deliveryTime') return a.deliveryTime - b.deliveryTime;
            if (filters.sortBy === 'minOrder') return a.minOrder - b.minOrder;
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
         r.name.toLowerCase().includes(query.toLowerCase()) ||
         r.cuisine.toLowerCase().includes(query.toLowerCase())
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
         {/* Hero Section */}
         <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 mb-8 rounded-lg">
            <div className="text-center">
               <h1 className="text-4xl font-bold mb-4">Distributed Food Delivery</h1>
               <p className="text-lg mb-6">
                  Experience distributed systems concepts through food delivery
               </p>

               {/* Search Bar */}
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

         {/* Filters */}
         <RestaurantFilters onFilterChange={handleFilterChange} />

         {/* Statistics */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
               <p className="text-3xl font-bold text-blue-600">{restaurants.length}</p>
               <p className="text-gray-600">Restaurants</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
               <p className="text-3xl font-bold text-green-600">
                  {restaurants.filter(r => r.isOpen).length}
               </p>
               <p className="text-gray-600">Open Now</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
               <p className="text-3xl font-bold text-purple-600">3</p>
               <p className="text-gray-600">Active Nodes</p>
            </div>
         </div>

         {/* Restaurants Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(restaurant => (
               <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
         </div>

         {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
               <p className="text-gray-500 text-lg">No restaurants found</p>
            </div>
         )}
      </div>
   );
};

export default HomePage;
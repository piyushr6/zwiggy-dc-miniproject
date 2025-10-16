const express = require('express');
const router = express.Router();

// Placeholder admin route
router.get('/', (req, res) => {
   res.send("Admin route is working!");
});

// Example: Get summary of orders (can expand later)
router.get('/summary', async (req, res) => {
   try {
      const Order = require('../models/order');
      const Restaurant = require('../models/restaurant');

      const totalOrders = await Order.countDocuments();
      const totalRestaurants = await Restaurant.countDocuments();

      res.json({
         totalOrders,
         totalRestaurants,
         message: "Admin summary data"
      });
   } catch (err) {
      res.status(500).json({ message: err.message });
   }
});

module.exports = router;
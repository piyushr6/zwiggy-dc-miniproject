const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurant'); // model

// GET all restaurants
router.get('/', async (req, res) => {
   const restaurants = await Restaurant.find();
   res.json(restaurants);
});

// POST add restaurant
router.post('/', async (req, res) => {
   try {
      const restaurant = new Restaurant(req.body);
      const saved = await restaurant.save();
      res.status(201).json(saved);
   } catch (err) {
      res.status(400).json({ message: err.message });
   }
});

module.exports = router;
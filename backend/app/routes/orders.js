const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// Get all orders
router.get('/', async (req, res) => {
   const orders = await Order.find();
   res.json(orders);
});

// Place a new order
router.post('/', async (req, res) => {
   try {
      const order = new Order(req.body);
      const savedOrder = await order.save();
      res.status(201).json(savedOrder);
   } catch (err) {
      res.status(400).json({ message: err.message });
   }
});

module.exports = router;
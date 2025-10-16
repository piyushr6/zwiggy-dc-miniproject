const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
   userId: { type: String, required: true },
   restaurantId: { type: String, required: true },
   items: [
      {
         dishName: String,
         quantity: Number,
         price: Number
      }
   ],
   totalAmount: Number,
   status: { type: String, default: "pending" },
   createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
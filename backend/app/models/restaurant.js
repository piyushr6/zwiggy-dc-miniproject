const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
   name: { type: String, required: true },
   address: String,
   menu: [
      {
         dishName: String,
         price: Number,
         quantityAvailable: Number
      }
   ]
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
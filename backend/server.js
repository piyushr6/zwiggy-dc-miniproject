const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const orderRoutes = require('./app/routes/orders');
const restaurantRoutes = require('./app/routes/restaurants');
const adminRoutes = require('./app/routes/admin');

app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (req, res) => {
   res.send("Backend running!");
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT} !!`);
});
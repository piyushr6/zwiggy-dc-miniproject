import connectDB from './config/db';
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

//middleware
const app = express();
app.use(cors());
app.use(bodyParser.json());

connectDB();

//Example Route
app.get('/', (req, res) => {
   res.send("Server is running and connected to MongoDB!");
});

//start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const orderRoutes = require('./app/routes/orders');
const restaurantRoutes = require('./app/routes/restaurants');

app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);

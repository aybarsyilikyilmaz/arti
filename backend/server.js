require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const businessRoutes = require('./routes/businessRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet()); 
app.use(cors()); 
app.use(express.json({ limit: '10kb' })); 

const limiter = rateLimit({
  max: 10000, 
  windowMs: 15 * 60 * 1000, 
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/arti', {
})
.then(() => console.log('DB connection successful!'))
.catch(err => console.log('DB connection error:', err));

app.use('/api/v1/business', businessRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

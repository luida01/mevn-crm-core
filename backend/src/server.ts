import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import customerRoutes from './routes/customerRoutes';
import mangaRoutes from './routes/mangaRoutes';
import rentalRoutes from './routes/rentalRoutes';
import shopRoutes from './routes/shopRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/mangas', mangaRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/shop', shopRoutes);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mevn-crm';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Basic Route
app.get('/', (req, res) => {
    res.send('MEVN CRM API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

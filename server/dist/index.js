import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { weatherRouter } from './api/weather.js';
import { locationRouter } from './api/weather/location.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Weather API routes
app.use('/api/weather', weatherRouter);
app.use('/api/weather', locationRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

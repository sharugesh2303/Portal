import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import facultyRoutes from './routes/faculty.js';
import salaryRoutes from './routes/Salary.js';

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const port = process.env.PORT || 8000;

// =======================================================
// --- CRITICAL CORS CONFIGURATION (Final and Secure) ---
// =======================================================
// Define ALL domains allowed to request resources from this server.
const allowedOrigins = [
    // 1. New, Definitive Vercel Alias:
    'https://jjcetcollegeportal.vercel.app', 
    
    // 2. Previous Aliases (Kept for safety/testing domains):
    'https://portal-one-mocha.vercel.app', 
    'https://portal-git-main-sharugeth2303s-projects.vercel.app',
    
    // 3. Your Render Backend Domain (The host of this API):
    'https://portal-jjd.onrender.com' 
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests if they come from an allowed origin (or if they have no origin, e.g., Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Block the request
            callback(new Error('Not allowed by CORS policy. Origin rejected.'), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Crucial for sending authentication tokens/headers
};

// Apply the configured CORS middleware
app.use(cors(corsOptions));
// =======================================================


// This allows the server to accept and parse JSON in request bodies
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/salary', salaryRoutes);

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// --- Basic Routes ---
app.get('/', (req, res) => {
  res.send('Hello from the College Portal Server!');
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
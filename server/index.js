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
// --- CRITICAL CORS CONFIGURATION (Updated) ---
// =======================================================
// Define the ONLY domains allowed to request resources from this server (your frontend/backend)
const allowedOrigins = [
    // 1. Your Vercel Frontend URL:
    'https://portal-one-mocha.vercel.app',
    // 2. Your Render Backend URL (Good practice):
    'https://portal-lxfd.onrender.com' 
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests if they come from an allowed origin or if they have no origin (e.g., Postman, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Block the request and log an error
            callback(new Error('Not allowed by CORS policy. Origin rejected.'), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true // Crucial for sending cookies/auth headers
};

// Apply the configured CORS middleware
app.use(cors(corsOptions));
// =======================================================


// This allows the server to accept and parse JSON in request bodies
app.use(express.json());

// --- API Routes ---
// It tells the server that any URL starting with /api/auth should be handled by 'authRoutes'
app.use('/api/auth', authRoutes);

// Any URL starting with /api/faculty should be handled by 'facultyRoutes'
app.use('/api/faculty', facultyRoutes);

// Any URL starting with /api/salary should be handled by 'salaryRoutes'
app.use('/api/salary', salaryRoutes);

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit the process if DB connection fails
  });

// --- Basic Routes ---
app.get('/', (req, res) => {
  res.send('Hello from the College Portal Server!');
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
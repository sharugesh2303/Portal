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
// --- CRITICAL CORS CONFIGURATION (Final Origin List) ---
// =======================================================
// Define ALL domains allowed to request resources from this server.
const allowedOrigins = [
    // --- LOCALHOST DEVELOPMENT DOMAINS (UPDATED) ---
    'http://localhost:3000', // Common port for React Dev
    'http://localhost:8000', // Your local backend port
    'http://localhost:5173', // Your current frontend development port (local)
    
    // --- CLOUD PRODUCTION DOMAINS ---
    'https://jjcetcollegeportal.vercel.app', // <--- FIX: Added the deployed Vercel URL
    'https://portal-one-mocha.vercel.app', 
    'https://portal-git-main-shanugesh2303s-projects.vercel.app',
    'https://portal-lxfd.onrender.com' 
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl or postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Log the rejected origin for debugging
            console.error('CORS: Origin rejected ->', origin); 
            callback(new Error('Not allowed by CORS policy. Origin rejected.'), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
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
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

// --- Middlewares ---
// =======================================================
// --- CRITICAL CORS CONFIGURATION (Updated and Secure) ---
// =======================================================
const allowedOrigins = [
    'https://portal-git-main-shanugeth2303s-projects.vercel.app', 
    'https://jjcetcollegeportal.vercel.app/', 
    'https://portal-lxfd.onrender.com' 
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
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
// It tells the server that any URL starting with /api/auth
// should be handled by the 'authRoutes' file.
app.use('/api/auth', authRoutes);

// Any URL starting with /api/faculty
// should be handled by the 'facultyRoutes' file.
app.use('/api/faculty', facultyRoutes);

// Any URL starting with /api/salary
// should be handled by the 'salaryRoutes' file.
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
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken'; // <-- Import JWT

const router = express.Router();

// --- Login Endpoint ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // --- 3. Login Successful! (THE BIG CHANGE IS HERE) ---
    
    // Create the token. This token "proves" who the user is.
    const token = jwt.sign(
      { id: user._id, role: user.role }, // The data to store in the token
      process.env.JWT_SECRET,             // The secret key from .env
      { expiresIn: '1d' }                  // Token expires in 1 day
    );

    // Send back the token AND the user's data
    res.status(200).json({
      token, // Send the token to the client
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
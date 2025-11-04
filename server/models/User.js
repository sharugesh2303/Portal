import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password (or DOB) is required'],
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'faculty'], // only two roles allowed
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    // ======================
    // 🧩 FACULTY DETAILS
    // ======================
    department: {
      type: String,
      default: 'N/A',
      trim: true,
    },
    designation: {
      type: String,
      default: 'N/A',
      trim: true,
    },
    baseSalary: {
      type: Number,
      default: 0,
      min: [0, 'Base salary cannot be negative'],
    },

    // Optional: keep old "salary" for compatibility or remove if unused
    salary: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create the model
const User = mongoose.model('User', userSchema);

export default User;

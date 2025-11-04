import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import User from '../models/User.js'; // our User model
import protect from '../middleware/authMiddleware.js'; // The token protector

const router = express.Router();

// --- Multer setup for CSV file upload ---
const upload = multer({ dest: 'uploads/' });

// --- Fields to be consistently included in GET, POST, and PUT operations ---
// Non-sensitive fields:
const PUBLIC_FACULTY_FIELDS = 'name username department designation baseSalary';

// Sensitive field (to be excluded from public view):
const SENSITIVE_FIELDS = 'password';


// --- 1. GET ALL FACULTY (FOR DASHBOARD LIST) ---
// @route   GET /api/faculty
router.get('/', async (req, res) => {
  try {
    // CORRECTION: Explicitly select all public fields. Password will be excluded by default.
    const faculty = await User.find({ role: 'faculty' })
                           .select(PUBLIC_FACULTY_FIELDS);
    res.json(faculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 2. GET LOGGED-IN FACULTY'S DATA (FIXED FOR PROJECTION ERROR) ---
// @route   GET /api/faculty/me
router.get('/me', protect, async (req, res) => {
  try {
    // 🛑 FIX: Use Exclusion Projection to consistently hide the sensitive field (password).
    // MongoDB allows mixing inclusions and exclusions IF the ONLY exclusion is '-password'.
    // However, the safest method is to explicitly select what we want, and use '-password' 
    // for security in case default schema includes sensitive data.
    
    // We explicitly exclude only the password field. The other public fields will be returned.
    const faculty = await User.findById(req.user.id).select('-password'); 

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    if (faculty.role !== 'faculty') {
      return res.status(403).json({ message: 'User is not a faculty member' });
    }

    res.json(faculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 3. GET SINGLE FACULTY BY ID (FOR EDIT PAGE) ---
// @route   GET /api/faculty/:id
router.get('/:id', async (req, res) => {
  try {
    // CORRECTION: Retrieve all fields, including the password for editing, but exclude other fields
    const faculty = await User.findById(req.params.id)
                           .select(PUBLIC_FACULTY_FIELDS + ' ' + SENSITIVE_FIELDS); // Select all 6 fields
                           
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 4. ADD (CREATE) SINGLE FACULTY ---
// @route   POST /api/faculty
router.post('/', async (req, res) => {
  const { username, password, name, department, designation, baseSalary } = req.body;
  
  if (!username || !password || !name || !department || !designation || baseSalary === undefined || baseSalary === null) {
    return res.status(400).json({ message: 'Please provide all required fields: name, ID, password, department, designation, and base salary.' });
  }

  try {
    const newFaculty = new User({
      username,
      password,
      name,
      department,
      designation,
      baseSalary,
      role: 'faculty',
    });

    const savedFaculty = await newFaculty.save();
    res.status(201).json(savedFaculty); 
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username (Faculty ID) already exists' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 5. UPDATE (EDIT) FACULTY ---
// @route   PUT /api/faculty/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, name, department, designation, baseSalary } = req.body;

  const updateFields = { username, password, name, department, designation, baseSalary };

  try {
    const updatedFaculty = await User.findByIdAndUpdate(
      id,
      updateFields, 
      { new: true } 
    );

    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(updatedFaculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 6. DELETE FACULTY ---
// @route   DELETE /api/faculty/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFaculty = await User.findByIdAndDelete(id);

    if (!deletedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json({ message: 'Faculty deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- 7. UPLOAD CSV OF FACULTY DETAILS (ADD/UPDATE) ---
// NOTE: This route is redundant if using the salary router's upload, but corrected for completeness.
router.post('/upload', upload.single('file'), (req, res) => {
  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      let addedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;
      let errors = [];

      for (const item of results) {
        try {
          if (item.username && item.password && item.name) {
                const baseSalaryValue = parseFloat(item.baseSalary) || 0;
                
                const facultyData = {
                    name: item.name,
                    password: item.password,
                    department: item.department || 'N/A',
                    designation: item.designation || 'N/A',
                    baseSalary: baseSalaryValue,
                    role: 'faculty',
                };
                
            const existingUser = await User.findOneAndUpdate(
                    { username: item.username },
                    facultyData,
                    { upsert: true, new: true }
                );

                if (existingUser === null) {
                    addedCount++;
                } else {
                    updatedCount++;
                }

          } else {
            errorCount++;
            errors.push(`Missing data in row: ${JSON.stringify(item)}`);
          }
        } catch (err) {
          errorCount++;
          errors.push(`Error on row ${item.username}: ${err.message}`);
        }
      }

      fs.unlinkSync(filePath); // Delete the temp file

      res.status(201).json({
        message: 'Faculty Details CSV processing complete',
        added: addedCount,
        updated: updatedCount,
        failed: errorCount,
        errors: errors,
      });
    });
});

export default router;
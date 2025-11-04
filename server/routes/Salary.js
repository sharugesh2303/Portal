import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
// Assuming these models and middleware paths are correct relative to the router
import Salary from '../models/Salary.js'; 
import User from '../models/User.js'; 
import protect from '../middleware/authMiddleware.js'; 
import PDFDocument from 'pdfkit';
import archiver from 'archiver'; 

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// --- Helper Functions ---
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthOrder = MONTHS.reduce((acc, month, index) => {
  acc[month] = index;
  return acc;
}, {});

const getLastNMonths = (n) => {
  const result = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    result.push({
      month: MONTHS[d.getMonth()],
      year: d.getFullYear()
    });
  }
  return result;
};

const formatCurrency = (amount) => {
  return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 }); 
};

// --------------------------------------------------------------------------------------------------
// --- Helper: Draw College Header (FINAL: SINGLE IMAGE & BORDERLESS) ---
// --------------------------------------------------------------------------------------------------
const drawCollegeHeader = (doc, yStart = 30) => {
    const blackColor = '#000000';
    const logoPath = 'public/jjcet_logo.jpg'; // Single image path
    const margin = 50;
    const headerHeight = 90; // Height to cover the entire header visual
    
    let textY = yStart;

    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, margin, yStart, { width: doc.page.width - (2 * margin), height: headerHeight });
        textY += headerHeight;
    } else {
        doc.fillColor(blackColor).font('Helvetica-Bold').fontSize(18).text('JJCET COLLEGE HEADER (Image Missing)', 0, yStart + 20, { align: 'center' });
        textY += 60;
    }

    doc.strokeColor(blackColor)
       .lineWidth(1)
       .moveTo(50, textY + 5) 
       .lineTo(doc.page.width - 50, textY + 5)
       .stroke();
       
    return textY + 15; 
};

// --------------------------------------------------------------------------------------------------
// --- Helper: Payslip Generator (FINALIZED) ---
// --------------------------------------------------------------------------------------------------
const generatePayslip = (doc, salaryRecord, facultyUser, month, year) => {
    const blackColor = '#000000';
    
    const startX = 50;
    const rowHeight = 18; 
    const tableWidth = 510;
    const halfWidth = tableWidth / 2;
    const col1X = startX + 5; 
    const col2X = startX + 130; 
    const col3X = startX + 260 + 5; 
    const col4X = startX + 390; 
    const labelWidth = 90; 
    const valX = startX + 100;

    const gap = 5; 

    let currentY = drawCollegeHeader(doc); 

    currentY += 10; 
    doc.font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(blackColor)
        .text(`Pay Slip - ${month} ${year}`, 0, currentY, { align: 'center' });

    currentY += 30; 
    
    const tableY = currentY; 
    
    // 3. Employee Details
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Employee ID:', startX, currentY);
    doc.text('Month:', startX + 260, currentY);
    doc.font('Helvetica');
    doc.text(salaryRecord.username, valX, currentY); 
    doc.text(month, startX + 370, currentY); 
    currentY += 20;

    doc.font('Helvetica-Bold').text('Name:', startX, currentY);
    doc.text('Year:', startX + 260, currentY);
    doc.font('Helvetica');
    doc.text(salaryRecord.faculty.name, valX, currentY); 
    doc.text(year, startX + 370, currentY); 
    currentY += 20;
    
    doc.font('Helvetica-Bold').text('Department:', startX, currentY);
    doc.text('Faculty ID:', startX + 260, currentY);
    doc.font('Helvetica');
    doc.text(salaryRecord.faculty.department || 'N/A', valX, currentY); 
    doc.text(salaryRecord.username, startX + 370, currentY); 
    currentY += 20;

    doc.font('Helvetica-Bold').text('Designation:', startX, currentY);
    doc.font('Helvetica');
    doc.text(salaryRecord.faculty.designation || 'N/A', valX, currentY); 
    currentY += 30; 


    // 4. Emoluments & Deductions Table

    doc.strokeColor(blackColor).lineWidth(1).moveTo(startX, currentY).lineTo(startX + halfWidth, currentY).stroke();
    doc.strokeColor(blackColor).lineWidth(1).moveTo(startX + halfWidth + gap, currentY).lineTo(startX + tableWidth, currentY).stroke();
    currentY += 5; 

    doc.fillColor(blackColor).font('Helvetica-Bold').fontSize(10);
    doc.text('EMOLUMENTS', col1X, currentY);
    doc.text('AMOUNT (Rs.)', col2X + 20, currentY, { width: 80, align: 'right' });
    doc.text('DEDUCTIONS', col3X + gap, currentY);
    doc.text('AMOUNT (Rs.)', col4X, currentY, { width: 80, align: 'right' });
    currentY += rowHeight;

    doc.strokeColor(blackColor).lineWidth(1).moveTo(startX, currentY - 2).lineTo(startX + halfWidth, currentY - 2).stroke();
    doc.strokeColor(blackColor).lineWidth(1).moveTo(startX + halfWidth + gap, currentY - 2).lineTo(startX + tableWidth, currentY - 2).stroke();
    currentY += 5; 


    const emoluments = [
        { label: 'Basic and Grade Pay', value: salaryRecord.basic },
        { label: 'House Rent Allowance', value: salaryRecord.hra },
        { label: 'Dearness Allowance', value: salaryRecord.da },
        { label: 'Conveyance Allowance', value: salaryRecord.conveyance },
        { label: 'Medical Allowance', value: salaryRecord.medical },
        { label: 'Other Allowance', value: salaryRecord.other_earnings },
    ];

    const deductions = [
        { label: 'Provident Fund', value: salaryRecord.pf },
        { label: 'Professional Tax', value: salaryRecord.professionalTax },
        { label: 'Income Tax(TDS)', value: salaryRecord.tax },
        { label: 'Others', value: salaryRecord.other_deductions },
        { label: 'LLP', value: 0 }, 
    ];

    let grossPay = 0;
    let totalDeductions = 0;

    for (let i = 0; i < Math.max(emoluments.length, deductions.length); i++) {
        doc.fillColor(blackColor).font('Helvetica').fontSize(10);
        if (emoluments[i]) {
            doc.text(emoluments[i].label, col1X, currentY + 4);
            doc.text(formatCurrency(emoluments[i].value), col2X + 20, currentY + 4, { width: 80, align: 'right' });
            grossPay += emoluments[i].value;
        }
        if (deductions[i]) {
            doc.text(deductions[i].label, col3X + gap, currentY + 4); 
            const deductionValue = formatCurrency(deductions[i].value); 
            doc.text(deductionValue, col4X, currentY + 4, { width: 80, align: 'right' });
            totalDeductions += deductions[i].value;
        }
        currentY += rowHeight;
    }
    
    const minRows = 6;
    if ((currentY - tableY) / rowHeight < minRows) {
        currentY += rowHeight * (minRows - (currentY - tableY) / rowHeight);
    }
    
    // 5. Total Lines 
    
    // 5a. Line above Gross Pay / Total Deductions
    doc.strokeColor(blackColor).lineWidth(1).moveTo(startX, currentY - 2).lineTo(startX + halfWidth, currentY - 2).stroke();
    doc.strokeColor(blackColor).lineWidth(0.5).moveTo(startX, currentY).lineTo(startX + halfWidth, currentY).stroke();
    doc.strokeColor(blackColor).lineWidth(1).moveTo(startX + halfWidth + 5, currentY - 2).lineTo(startX + tableWidth, currentY - 2).stroke();
    doc.strokeColor(blackColor).lineWidth(0.5).moveTo(startX + halfWidth + 5, currentY).lineTo(startX + tableWidth, currentY).stroke();
    currentY += 5; 
    
    // 5b. Gross Pay / Total Deductions Text
    const grossTotalY = currentY;
    doc.fillColor(blackColor).font('Helvetica-Bold').fontSize(12);
    
    doc.text('Gross Pay', startX, grossTotalY);
    doc.text(formatCurrency(grossPay), col2X + 20, grossTotalY, { width: 80, align: 'right' });
    
    doc.text('Total Deductions', startX + halfWidth + 5, grossTotalY); 
    doc.text(formatCurrency(totalDeductions), col4X, grossTotalY, { width: 80, align: 'right' }); 
    currentY += rowHeight;

    // 5c. Line below Gross Pay / Total Deductions
    doc.strokeColor(blackColor).lineWidth(0.5).moveTo(startX, currentY).lineTo(startX + halfWidth, currentY).stroke();
    doc.strokeColor(blackColor).lineWidth(1).moveTo(startX, currentY + 2).lineTo(startX + halfWidth, currentY + 2).stroke();
    doc.strokeColor(blackColor).lineWidth(0.5).moveTo(startX + halfWidth + 5, currentY).lineTo(startX + tableWidth, currentY).stroke();
    doc.strokeColor(blackColor).lineWidth(1).moveTo(startX + halfWidth + 5, currentY + 2).lineTo(startX + tableWidth, currentY + 2).stroke();
    currentY += 15; 


    // 6. Net Pay Box
    currentY += 10;
    const netAmount = grossPay - totalDeductions;
    doc.rect(startX, currentY, tableWidth, rowHeight + 10).stroke(blackColor); 
    
    doc.fillColor(blackColor).font('Helvetica-Bold').fontSize(12);
    
    doc.text('NET PAY:', startX + 10, currentY + 8);
    
    doc.text(formatCurrency(netAmount), startX, currentY + 8, { width: tableWidth - 10, align: 'right' });
    currentY += rowHeight + 20;


    // 7. Authorized By (Removed)
    
    return doc;
};

// --------------------------------------------------------------------------------------------------
// --- 1. ADMIN: Upload Monthly Salary CSV ---
// --------------------------------------------------------------------------------------------------
router.post('/upload-monthly', upload.single('file'), async (req, res) => {
  const { month, year } = req.body;
  if (!month || !year) {
    return res.status(400).json({ message: 'Month and Year are required.' });
  }
  const results = [];
  const filePath = req.file.path;
  
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      let createdCount = 0;
      let errorCount = 0;
      let errors = [];

      for (const item of results) {
        try {
          if (!item.username || !item.basic || !item.pf || !item.tax) {
            throw new Error('Row missing username, basic, PF, or tax amount.');
          }

          const facultyUser = await User.findOne({ username: item.username, role: 'faculty' });
          if (!facultyUser) {
            throw new Error(`Faculty '${item.username}' not found.`);
          }

          const existingRecord = await Salary.findOne({
            faculty: facultyUser._id,
            month: month,
            year: year,
          });
          if (existingRecord) {
            throw new Error(`Salary for ${item.username} for ${month} ${year} already exists.`);
          }

          const basic = parseFloat(item.basic) || 0;
          const hra = parseFloat(item.hra) || 0;
          const da = parseFloat(item.da) || 0;
          const conveyance = parseFloat(item.conveyance) || 0;
          const medical = parseFloat(item.medical) || 0;
          const other_earnings = parseFloat(item.other_earnings) || 0;
          const pf = parseFloat(item.pf) || 0;
          const tax = parseFloat(item.tax) || 0;
          const professionalTax = parseFloat(item.professionalTax) || 0;
          const other_deductions = parseFloat(item.other_deductions) || 0;

          const totalEarnings = basic + hra + da + conveyance + medical + other_earnings;
          const totalDeductions = pf + tax + professionalTax + other_deductions;
          const netAmount = totalEarnings - totalDeductions;
          
          if (netAmount < 0) {
              throw new Error(`Calculated net amount is negative (${netAmount.toFixed(2)}). Check component values.`);
          }

          const newSalaryRecord = new Salary({
            faculty: facultyUser._id,
            username: item.username,
            month: month,
            year: year,
            amount: netAmount, 
            
            basic, hra, da, conveyance, medical, other_earnings,
            pf, tax, professionalTax, other_deductions
          });

          await newSalaryRecord.save();
          createdCount++;

        } catch (err) {
          errorCount++;
          errors.push(`Error on row ${JSON.stringify(item)}: ${err.message}`);
        }
      }

      fs.unlinkSync(filePath);
      res.status(201).json({
        message: 'Monthly Salary CSV processing complete',
        created: createdCount,
        failed: errorCount,
        errors: errors,
      });
    });
});

// --------------------------------------------------------------------------------------------------
// --- 2. FACULTY: Get My Salary History ---
// --------------------------------------------------------------------------------------------------
router.get('/my-history', protect, async (req, res) => {
  try {
    const salaryHistory = await Salary.find({ faculty: req.user.id })
                           .sort({ year: 'desc', month: 'desc' });
    res.json(salaryHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --------------------------------------------------------------------------------------------------
// --- 3. ADMIN: Get All Salary Uploads (Grouped) ---
// --------------------------------------------------------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    const history = await Salary.aggregate([
      { $group: { _id: { year: '$year', month: '$month' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
    
    const formattedHistory = history.map(item => ({
      year: item._id.year,
      month: item._id.month,
      monthOrder: item._id.month ? monthOrder[item._id.month] : -1,
      count: item.count,
    }));
    
    res.json(formattedHistory); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --------------------------------------------------------------------------------------------------
// --- 4. ADMIN/FACULTY: Download N-Month Collection of DETAILED Payslips (PDF) ---
// --- CRITICAL FIX: Ensures correct chronological ASCENDING sort for the PDF output.
// --------------------------------------------------------------------------------------------------
router.get('/report/:months', protect, async (req, res) => {
  try {
    const months = parseInt(req.params.months);
    if (![3, 6, 9, 12, 24, 36, 60].includes(months)) { 
      return res.status(400).json({ message: 'Invalid report period.' });
    }
    
    const dateRanges = getLastNMonths(months);
    const dateQuery = dateRanges.map(d => ({ month: d.month, year: d.year }));
    
    let records;
    let query = {};

    if (req.user.role === 'faculty') {
        // Faculty: Filter by logged-in faculty ID AND the time range
        query = { 
            faculty: req.user.id, 
            $or: dateQuery 
        };
        
        records = await Salary.find(query)
                             .populate('faculty', 'name username department designation')
                             .sort({ year: 1 }); // Initial sort by year ascending
        
        // **CRITICAL FIX: Apply in-memory sort using monthOrder for correct chronological ASCENDING order**
        records.sort((a, b) => {
            if (a.year !== b.year) {
                return a.year - b.year; // Sort by year ascending
            }
            // Sort by month index ascending (e.g., January (0) < February (1))
            return monthOrder[a.month] - monthOrder[b.month]; 
        });

    } else {
        // Admin: See all records within the time range
        query = { $or: dateQuery };
        
        records = await Salary.find(query)
                             .populate('faculty', 'name username department designation')
                             // Admin view often needs grouping by name, then date
                             .sort({ 'faculty.name': 1, year: -1, month: -1 }); 
    }

    if (records.length === 0) {
      return res.status(404).json({ message: 'No salary records found for this period.' });
    }
        
    const doc = new PDFDocument({ margin: 30, size: 'A4' }); 
    res.setHeader('Content-Type', 'application/pdf');
    // Ensure the filename reflects the bulk nature
    res.setHeader('Content-Disposition', `attachment; filename="Detailed_Payslip_Collection_Last_${months}_Months.pdf"`);
    doc.pipe(res);

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        generatePayslip(doc, record, record.faculty, record.month, record.year); 

        if (i < records.length - 1) {
            doc.addPage();
        }
    }

    doc.end();

  } catch (err) {
    console.error('Error generating multi-page detailed report:', err);
    res.status(500).json({ message: 'Server error generating detailed report.' });
  }
});


// --------------------------------------------------------------------------------------------------
// --- 5. ADMIN: Download DETAILED ANNUAL Payslip Report (PDF) ---
// --- FINAL FIX: Apply in-memory sort for chronological display.
// --------------------------------------------------------------------------------------------------
router.get('/download/:year', async (req, res) => {
  try {
    const { year } = req.params;
    
    // Fetch records for the entire year
    let records = await Salary.find({ year: parseInt(year) })
                              .populate('faculty', 'name username department designation')
                              .sort({ username: 1 }); // Initial DB sort by username

    if (records.length === 0) {
      return res.status(404).json({ message: 'No records found for this year.' });
    }

    // **CRITICAL FIX: Apply in-memory sort by Username (Group) then Month (Ascending) **
    records.sort((a, b) => {
        // Primary sort: Username (for grouping employees)
        if (a.username < b.username) return -1;
        if (a.username > b.username) return 1;

        // Secondary sort: Month Ascending
        return monthOrder[a.month] - monthOrder[b.month];
    });

    const doc = new PDFDocument({ margin: 30, size: 'A4' }); 
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Annual_Payslip_Report_${year}.pdf"`); 
    doc.pipe(res);

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        generatePayslip(doc, record, record.faculty, record.month, record.year); 

        if (i < records.length - 1) {
            doc.addPage();
        }
    }
    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating annual payslip report.' });
  }
});

// --------------------------------------------------------------------------------------------------
// --- 6. ADMIN: Download MONTHLY Payslip Report (PDF) ---
// --------------------------------------------------------------------------------------------------
router.get('/download/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const records = await Salary.find({ year: parseInt(year), month: month })
                              .populate('faculty', 'name username department designation')
                              .sort({ username: 1 }); 

    if (records.length === 0) {
      return res.status(404).json({ message: 'No records found for this period.' });
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' }); 
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Monthly_Payslip_Report_${month}_${year}.pdf"`); 
    doc.pipe(res);
    
    for (let i = 0; i < records.length; i++) {
        const record = records[i];

        generatePayslip(doc, record, record.faculty, record.month, record.year); 

        if (i < records.length - 1) {
            doc.addPage();
        }
    }
    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating monthly payslip report.' });
  }
});

// --------------------------------------------------------------------------------------------------
// --- 10. ADMIN: Delete Monthly Salary Records ---
// --------------------------------------------------------------------------------------------------
router.delete('/history/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const result = await Salary.deleteMany({ year: year, month: month });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No records found to delete for this period.' });
    }
    res.json({ message: `Successfully deleted ${result.deletedCount} records for ${month} ${year}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --------------------------------------------------------------------------------------------------
// --- 11. ADMIN: Upload Faculty Data CSV ---
// --------------------------------------------------------------------------------------------------
router.post('/upload-faculty', upload.single('file'), async (req, res) => {
    const results = [];
    const filePath = req.file.path;
    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            let successCount = 0;
            let errorCount = 0;
            let errors = [];

            for (const item of results) {
                try {
                    // Check for required core fields
                    if (!item.username || !item.name) {
                        throw new Error('Row missing name or username.');
                    }
                    
                    const baseSalaryValue = parseFloat(item.baseSalary) || 0;
                    
                    const userFields = {
                        name: item.name,
                        username: item.username,
                        password: item.password, 
                        department: item.department || 'N/A',
                        designation: item.designation || 'N/A',
                        baseSalary: baseSalaryValue, 
                        role: 'faculty', 
                    };
                    
                    await User.findOneAndUpdate(
                        { username: item.username }, 
                        userFields, 
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );

                    successCount++;

                } catch (err) {
                    errorCount++;
                    errors.push(`Error on faculty row ${JSON.stringify(item)}: ${err.message}`);
                }
            }

            fs.unlinkSync(filePath);
            res.status(201).json({
                message: 'Faculty Data CSV processing complete',
                successful: successCount,
                failed: errorCount,
                errors: errors,
            });
        });
});

// --------------------------------------------------------------------------------------------------
// --- 12. FACULTY/ADMIN: Download Detailed Payslip (PDF) ---
// --------------------------------------------------------------------------------------------------
router.get('/payslip/:username/:year/:month', protect, async (req, res) => {
  try {
    const { username, year, month } = req.params;

    const facultyUser = await User.findOne({ username });
    if (!facultyUser) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    if (req.user.role !== 'admin' && req.user.id.toString() !== facultyUser._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view your own payslips.' });
    }

    const salaryRecord = await Salary.findOne({
      faculty: facultyUser._id,
      year: parseInt(year),
      month: month,
    }).populate('faculty', 'name username department designation');

    if (!salaryRecord) {
      return res.status(404).json({ message: 'Payslip record not found for this period.' });
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' }); 
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Payslip_${username}_${month}_${year}.pdf"`);
    doc.pipe(res);

    generatePayslip(doc, salaryRecord, salaryRecord.faculty, month, year);

    doc.end();

  } catch (err) {
    console.error('Error generating payslip:', err);
    res.status(500).json({ message: 'Server error generating payslip.', error: err.message });
  }
});

// --------------------------------------------------------------------------------------------------
// --- 13. FACULTY/ADMIN: Download ALL Payslips for One Faculty (ZIP) ---
// --------------------------------------------------------------------------------------------------
router.get('/payslips-all/:username', protect, async (req, res) => {
    try {
        const { username } = req.params;

        const facultyUser = await User.findOne({ username });
        if (!facultyUser) {
            return res.status(404).json({ message: 'Faculty not found.' });
        }

        if (req.user.role !== 'admin' && req.user.id.toString() !== facultyUser._id.toString()) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        
        const salaryRecords = await Salary.find({ faculty: facultyUser._id })
            .populate('faculty', 'name username department designation')
            .sort({ year: 'desc', month: 'desc' });

        if (salaryRecords.length === 0) {
            return res.status(404).json({ message: 'No salary records found for this faculty.' });
        }

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="Payslips_${username}_All.zip"`);

        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', (err) => {
            console.error('Archiver Error:', err);
            if (!res.headersSent) { res.status(500).send({ error: err.message }); }
        });
        
        archive.pipe(res);

        for (const record of salaryRecords) {
            const pdfDoc = new PDFDocument({ margin: 30, size: 'A4' });
            
            generatePayslip(pdfDoc, record, record.faculty, record.month, record.year);
            
            pdfDoc.end();
            const pdfBuffer = await new Promise(resolve => {
                const chunks = [];
                pdfDoc.on('data', chunk => chunks.push(chunk));
                pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            });

            const monthNumber = String(monthOrder[record.month] + 1).padStart(2, '0');
            archive.append(pdfBuffer, { 
                name: `${record.year}-${monthNumber}_Payslip_${record.month}.pdf` 
            });
        }

        archive.finalize();

    } catch (err) {
        console.error('Error generating all payslips zip:', err);
        res.status(500).json({ message: 'Server error generating all payslips zip.', error: err.message });
    }
});

// --------------------------------------------------------------------------------------------------
// --- 14. ADMIN: Download All Detailed Payslips for ONE Month (ZIP) ---
// --------------------------------------------------------------------------------------------------
router.get('/payslips-monthly-all/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;

        const salaryRecords = await Salary.find({ year: parseInt(year), month: month })
            .populate('faculty', 'name username department designation');

        if (salaryRecords.length === 0) {
            return res.status(404).json({ message: 'No detailed salary records found for this month.' });
        }

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="Payslips_All_${month}_${year}.zip"`);

        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', (err) => {
            console.error('Archiver Error:', err);
            if (!res.headersSent) { res.status(500).send({ error: err.message }); }
        });
        
        archive.pipe(res);

        for (const record of salaryRecords) {
            const pdfDoc = new PDFDocument({ margin: 30, size: 'A4' });
            
            generatePayslip(doc, record, record.faculty, record.month, record.year);
            
            pdfDoc.end();
            const pdfBuffer = await new Promise(resolve => {
                const chunks = [];
                pdfDoc.on('data', chunk => chunks.push(chunk));
                pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            });

            archive.append(pdfBuffer, { 
                name: `${record.username}_Payslip_${record.month}_${record.year}.pdf` 
            });
        }

        archive.finalize();

    } catch (err) {
        console.error('Error generating bulk monthly payslips zip:', err);
        res.status(500).json({ message: 'Server error generating bulk monthly payslips zip.', error: err.message });
    }
});

export default router;
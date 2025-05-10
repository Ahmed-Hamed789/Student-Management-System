const express = require('express');
const Student = require('../models/Student');
const router = express.Router();
const mongoose = require('mongoose');

// CREATE a new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).send(student);
  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).send({ message: 'Student ID or Email already exists.', fields: error.keyValue });
    }
    res.status(400).send({ message: error.message || 'Failed to create student.' });
  }
});

// READ all students (with search, filter, and sort)
router.get('/', async (req, res) => {
  try {
    const {
      search,
      major, // Filter by major
      enrollmentDate_gte, // Enrollment date greater than or equal to
      enrollmentDate_lte, // Enrollment date less than or equal to
      sortBy, // Field to sort by (e.g., 'firstName', 'enrollmentDate')
      sortOrder, // 'asc' or 'desc'
    } = req.query;

    let query = {};

    // Search logic (across multiple fields)
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // 'i' for case-insensitive
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
        { major: searchRegex },
      ];
    }

    // Filtering logic
    if (major) {
      query.major = new RegExp(`^${major}$`, 'i'); // Exact match for major, case-insensitive
    }

    if (enrollmentDate_gte || enrollmentDate_lte) {
      query.enrollmentDate = {};
      if (enrollmentDate_gte) {
        if (isNaN(new Date(enrollmentDate_gte).getTime())) {
            return res.status(400).send({ message: 'Invalid enrollmentDate_gte format. Use YYYY-MM-DD.' });
        }
        query.enrollmentDate.$gte = new Date(enrollmentDate_gte);
      }
      if (enrollmentDate_lte) {
         if (isNaN(new Date(enrollmentDate_lte).getTime())) {
            return res.status(400).send({ message: 'Invalid enrollmentDate_lte format. Use YYYY-MM-DD.' });
        }
        // To include the whole day, set time to end of day
        let lteDate = new Date(enrollmentDate_lte);
        lteDate.setUTCHours(23, 59, 59, 999);
        query.enrollmentDate.$lte = lteDate;
      }
    }

    // Sorting logic
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      // Default sort
      sortOptions['lastName'] = 1;
      sortOptions['firstName'] = 1;
    }

    const students = await Student.find(query).sort(sortOptions);
    res.status(200).send(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).send({ message: error.message || 'Failed to retrieve students.' });
  }
});

// READ a single student by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ message: 'Invalid student ID format.' });
    }
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).send({ message: 'Student not found.' });
    }
    res.status(200).send(student);
  } catch (error) {
    res.status(500).send({ message: error.message || 'Failed to retrieve student.' });
  }
});

// UPDATE a student by ID
router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ message: 'Invalid student ID format.' });
    }
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) {
      return res.status(404).send({ message: 'Student not found.' });
    }
    res.status(200).send(student);
  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).send({ message: 'Update failed: Student ID or Email already exists for another student.', fields: error.keyValue });
    }
    res.status(400).send({ message: error.message || 'Failed to update student.' });
  }
});

// DELETE a student by ID
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ message: 'Invalid student ID format.' });
    }
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).send({ message: 'Student not found.' });
    }
    res.status(200).send({ message: 'Student deleted successfully.' });
  } catch (error) {
    res.status(500).send({ message: error.message || 'Failed to delete student.' });
  }
});

module.exports = router;
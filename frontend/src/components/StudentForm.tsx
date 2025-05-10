// filepath: frontend/src/components/StudentForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';

interface Student {
  _id?: string; // Optional for new students
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  major?: string;
}

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  student?: Student | null; // Student data for editing, null for new
  apiUrl: string;
}

const initialFormData: Student = {
  firstName: '',
  lastName: '',
  studentId: '',
  email: '',
  major: '',
};

export default function StudentForm({ open, onClose, onSave, student, apiUrl }: StudentFormProps) {
  const [formData, setFormData] = useState<Student>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        studentId: student.studentId || '',
        email: student.email || '',
        major: student.major || '',
        _id: student._id // Keep the id if editing
      });
    } else {
      setFormData(initialFormData);
    }
    setError(null); // Reset error when dialog opens or student changes
  }, [student, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (student && student._id) {
        // Update existing student
        await axios.patch(`${apiUrl}/${student._id}`, formData);
      } else {
        // Create new student
        const { _id, ...dataToSubmit } = formData; // Don't send _id for new student
        await axios.post(apiUrl, dataToSubmit);
      }
      onSave(); // Callback to refresh list and close
    } catch (err: any) {
      console.error('Failed to save student:', err);
      setError(err.response?.data?.message || 'An error occurred while saving the student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
      <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              autoFocus
              required
              margin="dense"
              id="firstName"
              name="firstName"
              label="First Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              margin="dense"
              id="lastName"
              name="lastName"
              label="Last Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.lastName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              margin="dense"
              id="studentId"
              name="studentId"
              label="Student ID"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.studentId}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              margin="dense"
              id="email"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              id="major"
              name="major"
              label="Major (Optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.major}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : (student ? 'Save Changes' : 'Add Student')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
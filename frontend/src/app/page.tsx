'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Button,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Box,
  TextField,
  InputAdornment,
  Grid, // For layout
  Select, // For dropdowns
  MenuItem, // For Select options
  FormControl, // For Select
  InputLabel, // For Select
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
// import FilterListIcon from '@mui/icons-material/FilterList'; // Not explicitly used in this version's UI but good for future
// import SortIcon from '@mui/icons-material/Sort'; // Not explicitly used in this version's UI but good for future
import StudentForm from '@/components/StudentForm';
import StudentMajorChart from '@/components/StudentMajorChart'; // Assuming you created this

// For a better date picker experience, you would set this up:
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Make sure to wrap your app or relevant part in <LocalizationProvider dateAdapter={AdapterDateFns}>

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  major?: string;
  enrollmentDate?: string; // This will be a string from backend, convert to Date if needed
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/students';

// Define available majors for filtering (can be dynamic later by fetching from backend)
const availableMajors = [
    "Computer Science", "Software Engineering", "Data Science", "Electrical Engineering",
    "Mechanical Engineering", "Civil Engineering", "Business Administration",
    "Psychology", "Biology", "Mathematics", "Physics", "Information Technology",
    "Cybersecurity", "Network Engineering", "Game Development", "Other"
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Search, Filter, Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [enrollmentDateStart, setEnrollmentDateStart] = useState(''); // YYYY-MM-DD
  const [enrollmentDateEnd, setEnrollmentDateEnd] = useState('');   // YYYY-MM-DD
  const [sortBy, setSortBy] = useState('lastName'); // Default sort field
  const [sortOrder, setSortOrder] = useState('asc');   // Default sort order

  const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): Promise<ReturnType<F>> => {
      return new Promise((resolve) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => resolve(func(...args)), delay);
      });
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchStudents = useCallback(
    debounce(async (params: Record<string, string>) => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL, { params });
        setStudents(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch students. Make sure the backend server is running.');
        console.error(err);
        setStudents([]); // Clear students on error
      } finally {
        setLoading(false);
      }
    }, 500), // 500ms debounce
    [] // API_URL is stable, no need to include
  );

  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (filterMajor) params.major = filterMajor;
    if (enrollmentDateStart) params.enrollmentDate_gte = enrollmentDateStart;
    if (enrollmentDateEnd) params.enrollmentDate_lte = enrollmentDateEnd;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    fetchStudents(params);
  }, [searchTerm, filterMajor, enrollmentDateStart, enrollmentDateEnd, sortBy, sortOrder, fetchStudents]);

  const getCurrentFilters = () => {
    const params: Record<string, string> = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (filterMajor) params.major = filterMajor;
    if (enrollmentDateStart) params.enrollmentDate_gte = enrollmentDateStart;
    if (enrollmentDateEnd) params.enrollmentDate_lte = enrollmentDateEnd;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    return params;
  };

  const handleFormOpen = (student?: Student) => {
    setEditingStudent(student || null);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingStudent(null);
  };

  const handleFormSave = async () => {
    fetchStudents(getCurrentFilters()); // Refresh list after save, considering current filters
    handleFormClose();
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setOpenDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      try {
        await axios.delete(`${API_URL}/${studentToDelete._id}`);
        fetchStudents(getCurrentFilters()); // Refresh list, considering current filters
        setError(null);
      } catch (err) {
        setError(`Failed to delete student: ${studentToDelete.firstName} ${studentToDelete.lastName}`);
        console.error(err);
      } finally {
        setOpenDeleteConfirm(false);
        setStudentToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteConfirm(false);
    setStudentToDelete(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterMajor('');
    setEnrollmentDateStart('');
    setEnrollmentDateEnd('');
    setSortBy('lastName'); // Reset to default sort
    setSortOrder('asc');   // Reset to default order
  };

  return (
    <Container maxWidth="lg"> {/* Increased max width for more controls */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Student Management System
      </Typography>

      {/* Controls Section */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="flex-end"> {/* alignItems to flex-end for button alignment */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Students"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-major-label">Filter by Major</InputLabel>
              <Select
                labelId="filter-major-label"
                value={filterMajor}
                label="Filter by Major"
                onChange={(e) => setFilterMajor(e.target.value)}
              >
                <MenuItem value=""><em>All Majors</em></MenuItem>
                {availableMajors.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="firstName">First Name</MenuItem>
                <MenuItem value="lastName">Last Name</MenuItem>
                <MenuItem value="studentId">Student ID</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="major">Major</MenuItem>
                <MenuItem value="enrollmentDate">Enrollment Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-order-label">Order</InputLabel>
              <Select
                labelId="sort-order-label"
                value={sortOrder}
                label="Order"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
           <Grid item xs={12} sm={6} md={1} sx={{textAlign: {xs: 'left', md: 'right'}}}> {/* Align button */}
             <Tooltip title="Clear Filters & Sort">
                <Button onClick={clearFilters} variant="outlined" size="medium" fullWidth={{xs: true, md: false}}>Clear</Button>
             </Tooltip>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mt: 1 }} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}>
                <TextField
                    fullWidth
                    label="Enrolled After"
                    variant="outlined"
                    size="small"
                    type="date" // Basic date input
                    value={enrollmentDateStart}
                    onChange={(e) => setEnrollmentDateStart(e.target.value)}
                    InputLabelProps={{ shrink: true }} // Ensures label doesn't overlap with date input
                    helperText="YYYY-MM-DD"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField
                    fullWidth
                    label="Enrolled Before"
                    variant="outlined"
                    size="small"
                    type="date" // Basic date input
                    value={enrollmentDateEnd}
                    onChange={(e) => setEnrollmentDateEnd(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="YYYY-MM-DD"
                />
            </Grid>
             <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleFormOpen()}
                >
                Add Student
                </Button>
            </Grid>
        </Grid>
      </Paper>

      {/* Data Visualization Placeholder */}
      {!loading && students.length > 0 && (
        <StudentMajorChart students={students} />
      )}
      {/* End Data Visualization Placeholder */}


      {error && <Alert severity="error" sx={{ mb: 2, mt: 2 }}>{error}</Alert>}

      {loading ? (
        <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Container>
      ) : students.length === 0 && !error ? (
        <Typography sx={{ textAlign: 'center', mt: 3 }}>
          {searchTerm || filterMajor || enrollmentDateStart || enrollmentDateEnd ? `No students found matching your criteria.` : 'No students found. Add some!'}
        </Typography>
      ) : (
        <List sx={{mt: 2}}>
          {students.map((student) => (
            <Paper elevation={2} sx={{ mb: 2 }} key={student._id}>
              <ListItem
                secondaryAction={
                  <>
                    <Tooltip title="Edit Student">
                      <IconButton edge="end" aria-label="edit" onClick={() => handleFormOpen(student)} sx={{ mr: 1}}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Student">
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(student)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              >
                <ListItemText
                  primary={`${student.firstName} ${student.lastName} (${student.studentId})`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {student.email}
                      </Typography>
                      {student.major && ` — Major: ${student.major}`}
                      {student.enrollmentDate && ` — Enrolled: ${new Date(student.enrollmentDate).toLocaleDateString()}`}
                    </>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      <StudentForm
        open={openForm}
        onClose={handleFormClose}
        onSave={handleFormSave}
        student={editingStudent}
        apiUrl={API_URL}
      />

      <Dialog
        open={openDeleteConfirm}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete {studentToDelete?.firstName} {studentToDelete?.lastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
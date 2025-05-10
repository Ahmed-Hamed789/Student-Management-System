// filepath: frontend/src/components/StudentMajorChart.tsx
'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Paper, Typography, Box } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Student {
  major?: string;
  // other student properties
}

interface StudentMajorChartProps {
  students: Student[];
}

const StudentMajorChart: React.FC<StudentMajorChartProps> = ({ students }) => {
  const majorCounts: Record<string, number> = {};
  students.forEach(student => {
    const major = student.major || 'Undefined';
    majorCounts[major] = (majorCounts[major] || 0) + 1;
  });

  const data = {
    labels: Object.keys(majorCounts),
    datasets: [
      {
        label: 'Number of Students',
        data: Object.values(majorCounts),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Students by Major',
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1 // Ensure y-axis shows whole numbers for counts
            }
        }
    }
  };

  if (students.length === 0) {
    return (
        <Paper elevation={3} sx={{ p: 2, mt: 3, textAlign: 'center' }}>
             <Typography variant="subtitle1">No data available for chart.</Typography>
        </Paper>
    )
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
      <Box sx={{maxHeight: '400px'}}> {/* Control chart height */}
         <Bar options={options} data={data} />
      </Box>
    </Paper>
  );
};

export default StudentMajorChart;
"use client"; // This is now a Client Component

import ThemeRegistry from "@/components/ThemeRegistry";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeRegistry>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
              Student Management
            </Link>
          </Typography>
          <Button color="inherit" component={Link} href="/students">
            Students
          </Button>
          {/* Add more navigation items here */}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto', // This ensures footer is at the bottom if content is short
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}{' '}
            Student Management System.
          </Typography>
        </Container>
      </Box>
    </ThemeRegistry>
  );
}
// REMOVE "use client" from here if it was added

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout"; // We will create this component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Management System",
  description: "CSE323 Advanced Database Systems Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
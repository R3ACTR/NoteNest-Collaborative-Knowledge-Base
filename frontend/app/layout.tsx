import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import CommandPalette from "@/components/CommandPalette";
import ErrorBoundary from "@/components/ErrorBoundary";
import { UserRoleProvider } from "@/contexts/UserRoleContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NoteNest - Collaborative Knowledge Base for Teams",
  description: "NoteNest is an open-source, team-based knowledge base that allows users to create, organize, and collaborate on notes and documentation in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${inter.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
          <WorkspaceProvider>
            <UserRoleProvider>
              <FeatureFlagProvider>
                <KeyboardShortcuts />
                <CommandPalette />
                {children}
              </FeatureFlagProvider>
            </UserRoleProvider>
          </WorkspaceProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

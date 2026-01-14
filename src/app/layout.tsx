"use client";
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Initialize Firebase services once.
const { firebaseApp, auth, firestore } = initializeFirebase();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>SVLSM Stock Manager</title>
        <meta name="description" content="Manage your stock with ease." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Arimo&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#2a1a1f" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="font-body antialiased">
        <FirebaseProvider value={{ firebaseApp, auth, firestore }}>
          <AuthProvider>
            {children}
            <Toaster />
            <FirebaseErrorListener />
          </AuthProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}

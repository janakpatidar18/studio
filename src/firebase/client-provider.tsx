
"use client";

import { AuthProvider } from "@/context/AuthContext";
import { initializeFirebase } from "@/firebase";
import { FirebaseProvider } from "@/firebase/provider";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

// Initialize Firebase services once on the client.
const { firebaseApp, auth, firestore } = initializeFirebase();

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseProvider value={{ firebaseApp, auth, firestore }}>
      <AuthProvider>
        {children}
        <Toaster />
        <FirebaseErrorListener />
      </AuthProvider>
    </FirebaseProvider>
  );
}

// We need to re-export the Toaster here because it was moved from the layout
// and this is the most convenient shared client boundary.
import { Toaster } from "@/components/ui/toaster";

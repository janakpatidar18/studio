
"use client";

import { initializeFirebase } from "@/firebase";
import { FirebaseProvider } from "@/firebase/provider";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";
import { Toaster } from "@/components/ui/toaster";

// Initialize Firebase services once on the client.
const { firebaseApp, auth, firestore } = initializeFirebase();

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseProvider value={{ firebaseApp, auth, firestore }}>
        {children}
        <Toaster />
        <FirebaseErrorListener />
    </FirebaseProvider>
  );
}

"use client";

import React, { ReactNode } from 'react';

// This file is no longer used as authentication has been removed.
// The AuthProvider is now a no-op, and useAuth is not used.

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  throw new Error("Authentication has been removed from this application.");
};

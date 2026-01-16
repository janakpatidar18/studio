
"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { addDoc, collection, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { GalleryImage, GalleryCategory } from '@/lib/data';
import { useMemo } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type NewGalleryImageData = Omit<GalleryImage, 'id' | 'createdAt'>
type UpdateGalleryImageData = Partial<Omit<GalleryImage, 'id' | 'image' | 'createdAt'>>;

interface InventoryContextType {
  galleryImages: GalleryImage[] | null;
  addGalleryImage: (imageData: NewGalleryImageData) => Promise<void>;
  updateGalleryImage: (imageId: string, imageData: UpdateGalleryImageData) => Promise<void>;
  deleteGalleryImage: (imageId: string) => Promise<void>;
  galleryCategories: GalleryCategory[] | null;
  addGalleryCategory: (categoryName: string) => Promise<{ success: boolean, message?: string }>;
  removeGalleryCategory: (categoryId: string) => Promise<{ success: boolean, message?: string }>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const DEFAULT_GALLERY_CATEGORIES: Omit<GalleryCategory, 'id'>[] = [
    { name: 'Pannel Doors' },
    { name: 'CNC Carving Doors' },
    { name: 'Pooja Room Doors' },
    { name: 'Double Doors' },
    { name: 'Double Main Door ( with safety door )' },
    { name: 'Choukat' },
    { name: 'Others' },
];

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  
  const galleryCategoriesQuery = useMemo(() => firestore ? collection(firestore, 'galleryCategories') : null, [firestore]);
  const { data: galleryCategories, loading: galleryCategoriesLoading } = useCollection<GalleryCategory>(galleryCategoriesQuery);

  const galleryQuery = useMemo(() => firestore ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')) : null, [firestore]);
  const { data: galleryImages, loading: galleryImagesLoading } = useCollection<GalleryImage>(galleryQuery);

  useEffect(() => {
    const seedDatabase = async () => {
      if (!firestore) return;

      const isDataLoaded = !galleryCategoriesLoading;
      const isDbEmpty = galleryCategories?.length === 0;

      if (isDataLoaded && isDbEmpty) {
        console.log("Database is empty. Seeding with default data...");
        const batch = writeBatch(firestore);

        // Add default gallery categories
        const galleryCategoriesCollection = collection(firestore, 'galleryCategories');
        DEFAULT_GALLERY_CATEGORIES.forEach(category => {
            const docRef = doc(galleryCategoriesCollection);
            batch.set(docRef, category);
        });

        await batch.commit().catch(e => {
            console.error("Error seeding database: ", e);
        });
      }
    };

    seedDatabase();
  }, [firestore, galleryCategories, galleryCategoriesLoading]);

  const addGalleryCategory = async (categoryName: string) => {
    if (!firestore) return { success: false, message: 'Database not connected.' };

    if (galleryCategories?.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
      return { success: false, message: 'Gallery category already exists.' };
    }
    const galleryCategoriesCollection = collection(firestore, 'galleryCategories');
    const categoryData = { name: categoryName };
    await addDoc(galleryCategoriesCollection, categoryData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: galleryCategoriesCollection.path,
            operation: 'create',
            requestResourceData: categoryData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
    return { success: true };
  };

  const removeGalleryCategory = async (categoryId: string) => {
    if (!firestore || !galleryCategories || !galleryImages) return { success: false, message: 'Database not connected or data not loaded.' };
    
    const categoryToRemove = galleryCategories.find(c => c.id === categoryId);
    const isCategoryInUse = galleryImages.some(item => item.category === categoryToRemove?.name);

    if (isCategoryInUse) {
      return { success: false, message: `Category is in use by gallery images and cannot be removed.` };
    }
    const categoryDoc = doc(firestore, 'galleryCategories', categoryId);
    await deleteDoc(categoryDoc).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: categoryDoc.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
    return { success: true };
  };


  const addGalleryImage = async (imageData: NewGalleryImageData) => {
    if (!firestore) return;
    const galleryCollection = collection(firestore, 'gallery');
    const newImageData = {
        ...imageData,
        createdAt: serverTimestamp()
    }
    await addDoc(galleryCollection, newImageData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: galleryCollection.path,
            operation: 'create',
            requestResourceData: newImageData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const updateGalleryImage = async (imageId: string, imageData: UpdateGalleryImageData) => {
    if (!firestore) return;
    const imageDoc = doc(firestore, 'gallery', imageId);
    await updateDoc(imageDoc, imageData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: imageDoc.path,
            operation: 'update',
            requestResourceData: imageData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const deleteGalleryImage = async (imageId: string) => {
    if (!firestore) return;
    const imageDoc = doc(firestore, 'gallery', imageId);
    await deleteDoc(imageDoc).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: imageDoc.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };


  return (
    <InventoryContext.Provider value={{ 
        galleryImages,
        addGalleryImage,
        updateGalleryImage,
        deleteGalleryImage,
        galleryCategories,
        addGalleryCategory,
        removeGalleryCategory,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

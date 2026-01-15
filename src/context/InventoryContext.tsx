
"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { Category, InventoryItem } from '@/lib/data';
import { useMemo } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type NewProductData = Omit<InventoryItem, 'id'>;

interface InventoryContextType {
  inventoryItems: InventoryItem[] | null;
  addProduct: (product: NewProductData) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateStock: (itemId: string, quantity: number, type: 'add' | 'sell') => Promise<{ success: boolean; message?: string }>;
  categories: Category[] | null;
  addCategory: (categoryName: string) => Promise<{ success: boolean, message?: string }>;
  removeCategory: (categoryId: string) => Promise<{ success: boolean, message?: string }>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Sawn Timber' },
  { name: 'Door' },
  { name: 'Machinery' },
];

const DEFAULT_INVENTORY: Omit<InventoryItem, 'id'>[] = [
  {
    name: 'Neem Wood',
    type: 'Sawn Timber',
    quantity: 100,
    sellingPrice: 1200,
    image: 'https://picsum.photos/seed/1/600/600',
  },
  {
    name: 'Pine Wood',
    type: 'Sawn Timber',
    quantity: 150,
    sellingPrice: 900,
    image: 'https://picsum.photos/seed/2/600/600',
  },
  {
    name: 'Teak Wood Single Door',
    type: 'Door',
    quantity: 20,
    sellingPrice: 8000,
    image: 'https://picsum.photos/seed/3/600/600',
  },
  {
    name: 'Wood Cutting Machine',
    type: 'Machinery',
    quantity: 5,
    sellingPrice: 25000,
    image: 'https://picsum.photos/seed/4/600/600',
  },
];


export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();

  const inventoryQuery = useMemo(() => firestore ? collection(firestore, 'inventory') : null, [firestore]);
  const { data: inventoryItems, loading: inventoryLoading, error: inventoryError } = useCollection<InventoryItem>(inventoryQuery);
  
  const categoriesQuery = useMemo(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCollection<Category>(categoriesQuery);

  useEffect(() => {
    const seedDatabase = async () => {
      if (!firestore) return;

      // Check if both collections are not loading and are empty
      if (!inventoryLoading && !categoriesLoading && inventoryItems?.length === 0 && categories?.length === 0) {
        console.log("Database is empty. Seeding with default data...");
        const batch = writeBatch(firestore);

        // Add default categories
        const categoriesCollection = collection(firestore, 'categories');
        DEFAULT_CATEGORIES.forEach(category => {
          const docRef = doc(categoriesCollection);
          batch.set(docRef, category);
        });

        // Add default inventory items
        const inventoryCollection = collection(firestore, 'inventory');
        DEFAULT_INVENTORY.forEach(item => {
          const docRef = doc(inventoryCollection);
          batch.set(docRef, item);
        });

        try {
          await batch.commit();
          console.log("Database seeded successfully.");
        } catch (e) {
          console.error("Error seeding database: ", e);
        }
      }
    };

    seedDatabase();
  }, [firestore, inventoryItems, categories, inventoryLoading, categoriesLoading]);


  const addProduct = async (productData: NewProductData) => {
    if (!firestore) return;
    const inventoryCollection = collection(firestore, 'inventory');
    await addDoc(inventoryCollection, productData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: inventoryCollection.path,
            operation: 'create',
            requestResourceData: productData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const deleteProduct = async (productId: string) => {
    if (!firestore) return;
    const productDoc = doc(firestore, 'inventory', productId);
    await deleteDoc(productDoc).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: productDoc.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const updateStock = async (itemId: string, quantity: number, type: 'add' | 'sell') => {
    if (!firestore || !inventoryItems) return { success: false, message: 'Database not connected or inventory not loaded.' };
    
    const itemToUpdate = inventoryItems.find(item => item.id === itemId);
    if (!itemToUpdate) {
      return { success: false, message: 'Item not found.' };
    }

    if (type === 'sell' && itemToUpdate.quantity < quantity) {
        return { success: false, message: `Not enough stock for ${itemToUpdate.name}. Only ${itemToUpdate.quantity} available.` };
    }
    
    const productDoc = doc(firestore, 'inventory', itemId);
    const newQuantity = type === 'add' ? itemToUpdate.quantity + quantity : itemToUpdate.quantity - quantity;
    
    const updateData = { quantity: newQuantity };
    await updateDoc(productDoc, updateData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: productDoc.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    return { success: true };
  };
  
  const addCategory = async (categoryName: string) => {
    if (!firestore) return { success: false, message: 'Database not connected.' };

    if (categories?.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
      return { success: false, message: 'Category already exists.' };
    }
    const categoriesCollection = collection(firestore, 'categories');
    const categoryData = { name: categoryName };
    await addDoc(categoriesCollection, categoryData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: categoriesCollection.path,
            operation: 'create',
            requestResourceData: categoryData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
    return { success: true };
  };

  const removeCategory = async (categoryId: string) => {
    if (!firestore || !categories || !inventoryItems) return { success: false, message: 'Database not connected or data not loaded.' };
    
    const categoryToRemove = categories.find(c => c.id === categoryId);
    const isCategoryInUse = inventoryItems.some(item => item.type === categoryToRemove?.name);

    if (isCategoryInUse) {
      return { success: false, message: `Category is in use and cannot be removed.` };
    }
    const categoryDoc = doc(firestore, 'categories', categoryId);
    await deleteDoc(categoryDoc).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: categoryDoc.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
    return { success: true };
  };

  return (
    <InventoryContext.Provider value={{ 
        inventoryItems, 
        addProduct, 
        deleteProduct, 
        updateStock, 
        categories, 
        addCategory, 
        removeCategory 
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

    

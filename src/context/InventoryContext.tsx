"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { Category, InventoryItem } from '@/lib/data';
import { Cog, Box } from 'lucide-react';
import { useMemo } from 'react';

type NewProductData = Omit<InventoryItem, 'id' | 'icon'>;

interface InventoryContextType {
  inventoryItems: InventoryItem[];
  addProduct: (product: NewProductData) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateStock: (itemId: string, quantity: number, type: 'add' | 'sell') => Promise<{ success: boolean; message?: string }>;
  categories: Category[];
  addCategory: (categoryName: string) => Promise<{ success: boolean, message?: string }>;
  removeCategory: (categoryId: string) => Promise<{ success: boolean, message?: string }>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();

  const inventoryQuery = useMemo(() => firestore ? collection(firestore, 'inventory') : null, [firestore]);
  const { data: inventoryItems, loading: inventoryLoading, error: inventoryError } = useCollection<InventoryItem>(inventoryQuery);
  
  const categoriesQuery = useMemo(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCollection<Category>(categoriesQuery);

  const addProduct = async (productData: NewProductData) => {
    if (!firestore) return;
    const inventoryCollection = collection(firestore, 'inventory');
    await addDoc(inventoryCollection, productData);
  };

  const deleteProduct = async (productId: string) => {
    if (!firestore) return;
    const productDoc = doc(firestore, 'inventory', productId);
    await deleteDoc(productDoc);
  };

  const updateStock = async (itemId: string, quantity: number, type: 'add' | 'sell') => {
    if (!firestore) return { success: false, message: 'Database not connected.' };
    
    const itemToUpdate = inventoryItems?.find(item => item.id === itemId);
    if (!itemToUpdate) {
      return { success: false, message: 'Item not found.' };
    }

    if (type === 'sell' && itemToUpdate.quantity < quantity) {
        return { success: false, message: `Not enough stock for ${itemToUpdate.name}. Only ${itemToUpdate.quantity} available.` };
    }
    
    const productDoc = doc(firestore, 'inventory', itemId);
    const newQuantity = type === 'add' ? itemToUpdate.quantity + quantity : itemToUpdate.quantity - quantity;
    await updateDoc(productDoc, { quantity: newQuantity });

    return { success: true };
  };
  
  const addCategory = async (categoryName: string) => {
    if (!firestore) return { success: false, message: 'Database not connected.' };

    if (categories?.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
      return { success: false, message: 'Category already exists.' };
    }
    const categoriesCollection = collection(firestore, 'categories');
    await addDoc(categoriesCollection, { name: categoryName });
    return { success: true };
  };

  const removeCategory = async (categoryId: string) => {
    if (!firestore) return { success: false, message: 'Database not connected.' };
    
    const categoryToRemove = categories?.find(c => c.id === categoryId);
    const isCategoryInUse = inventoryItems?.some(item => item.type === categoryToRemove?.name);

    if (isCategoryInUse) {
      return { success: false, message: `Category is in use and cannot be removed.` };
    }
    const categoryDoc = doc(firestore, 'categories', categoryId);
    await deleteDoc(categoryDoc);
    return { success: true };
  };

  const enrichedInventory = useMemo(() => {
    return inventoryItems?.map(item => ({
      ...item,
      icon: item.type === 'Machinery' ? Cog : Box
    })) ?? [];
  }, [inventoryItems]);


  return (
    <InventoryContext.Provider value={{ 
        inventoryItems: enrichedInventory, 
        addProduct, 
        deleteProduct, 
        updateStock, 
        categories: categories ?? [], 
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

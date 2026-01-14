"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { inventoryItems as initialInventoryItems, InventoryItem } from '@/lib/data';
import { Cog, Box } from 'lucide-react';

type NewProductData = Omit<InventoryItem, 'id' | 'icon'> & { image: string };

interface InventoryContextType {
  inventoryItems: InventoryItem[];
  addProduct: (product: NewProductData) => void;
  deleteProduct: (productId: string) => void;
  updateStock: (itemName: string, quantity: number, type: 'add' | 'sell') => { success: boolean; message?: string };
  categories: string[];
  addCategory: (category: string) => { success: boolean, message?: string };
  removeCategory: (category: string) => { success: boolean, message?: string };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [categories, setCategories] = useState<string[]>(['Material', 'Machinery']);

  const addProduct = (productData: NewProductData) => {
    const newProduct: InventoryItem = {
      id: (inventoryItems.length + 1 + Math.random()).toString(),
      ...productData,
      icon: productData.type === 'Machinery' ? Cog : Box,
    };
    setInventoryItems(prevItems => [...prevItems, newProduct]);
  };

  const deleteProduct = (productId: string) => {
    setInventoryItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateStock = (itemName: string, quantity: number, type: 'add' | 'sell') => {
    const itemToUpdate = inventoryItems.find(item => item.name === itemName);
    if (!itemToUpdate) {
      return { success: false, message: 'Item not found.' };
    }

    if (type === 'sell' && itemToUpdate.quantity < quantity) {
        return { success: false, message: `Not enough stock for ${itemName}. Only ${itemToUpdate.quantity} available.` };
    }

    setInventoryItems(prevItems =>
      prevItems.map(item => {
        if (item.name === itemName) {
          return {
            ...item,
            quantity: type === 'add' ? item.quantity + quantity : item.quantity - quantity,
          };
        }
        return item;
      })
    );
    return { success: true };
  };
  
  const addCategory = (category: string) => {
    if (categories.includes(category)) {
      return { success: false, message: 'Category already exists.' };
    }
    setCategories(prev => [...prev, category]);
    return { success: true };
  };

  const removeCategory = (categoryToRemove: string) => {
    const isCategoryInUse = inventoryItems.some(item => item.type === categoryToRemove);
    if (isCategoryInUse) {
      return { success: false, message: `Category is in use and cannot be removed.` };
    }
    setCategories(prev => prev.filter(c => c !== categoryToRemove));
    return { success: true };
  };


  return (
    <InventoryContext.Provider value={{ inventoryItems, addProduct, deleteProduct, updateStock, categories, addCategory, removeCategory }}>
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

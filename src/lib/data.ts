import { Cog, Box } from 'lucide-react';

export const inventoryItems: (Omit<InventoryItem, 'image'> & { image?: string })[] = [];

export type InventoryItem = {
    id: string;
    name: string;
    type: string;
    icon: React.ElementType;
    quantity: number;
    sellingPrice: number;
    image?: string;
};

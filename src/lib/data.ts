import { type Icon } from 'lucide-react';

export type InventoryItem = {
    id: string;
    name: string;
    type: string;
    icon?: React.ElementType | Icon;
    quantity: number;
    sellingPrice: number;
    image?: string;
};

export type Category = {
    id: string;
    name: string;
};

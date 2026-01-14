import { Cog, Box } from 'lucide-react';

export const inventoryItems: (Omit<InventoryItem, 'image'> & { image?: string })[] = [
  {
    id: '1',
    name: 'Oak Planks',
    type: 'Material',
    icon: Box,
    quantity: 150,
    sellingPrice: 25.50,
  },
  {
    id: '2',
    name: 'Pine Beams',
    type: 'Material',
    icon: Box,
    quantity: 80,
    sellingPrice: 18.00,
  },
  {
    id: '3',
    name: 'Circular Saw',
    type: 'Machinery',
    icon: Cog,
    quantity: 5,
    sellingPrice: 450.00,
  },
  {
    id: '4',
    name: 'Wood Varnish',
    type: 'Material',
    icon: Box,
    quantity: 200,
    sellingPrice: 15.75,
  },
  {
    id: '5',
    name: 'Door Hinges (pack of 20)',
    type: 'Material',
    icon: Box,
    quantity: 500,
    sellingPrice: 12.00,
  },
];

export type InventoryItem = {
    id: string;
    name: string;
    type: string;
    icon: React.ElementType;
    quantity: number;
    sellingPrice: number;
    image?: string;
};

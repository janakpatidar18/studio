
export type InventoryItem = {
    id: string;
    name: string;
    type: string;
    quantity: number;
    sellingPrice: number;
    image?: string;
};

export type Category = {
    id: string;
    name: string;
};

export type GalleryImage = {
    id: string;
    title: string;
    description?: string;
    image: string;
    createdAt: any;
}


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

export type GalleryCategory = {
    id: string;
    name: string;
}

export type GalleryImage = {
    id: string;
    title: string;
    category: string;
    image: string;
    createdAt: any;
}

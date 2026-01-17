"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/context/InventoryContext";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function GalleryPage() {
    const { galleryImages, galleryCategories } = useInventory();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    const isLoading = galleryImages === null;

    const filteredImages =
        selectedCategory === "All"
        ? galleryImages
        : galleryImages?.filter((item) => item.category === selectedCategory);

    return (
        <>
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline">Product Gallery</h1>
                    <p className="text-md sm:text-lg text-muted-foreground">
                        A showcase of our finest handcrafted products.
                    </p>
                </div>
            </header>

            <div className="flex items-center gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoading}>
                    <SelectTrigger id="category-filter" className="w-full sm:w-[300px] bg-accent/20 border-accent text-accent-foreground">
                        <SelectValue placeholder="Filter by Category..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        {galleryCategories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {isLoading && Array.from({length: 8}).map((_, i) => (
                    <Card key={i} className="overflow-hidden group shadow-lg">
                        <CardContent className="p-0">
                            <Skeleton className="aspect-[2/4] w-full" />
                        </CardContent>
                    </Card>
                ))}
                {filteredImages?.map((image) => (
                    <Card key={image.id} className="overflow-hidden group shadow-lg flex flex-col">
                        <CardHeader className="p-0 relative">
                             <div className="aspect-[2/4] relative" onClick={() => setSelectedImage(image.image)}>
                                <Image 
                                    src={image.image!}
                                    alt={image.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    data-ai-hint="product wood"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow" onClick={() => setSelectedImage(image.image)}>
                             <CardTitle className="text-base sm:text-lg leading-tight font-semibold cursor-pointer">{image.title}</CardTitle>
                              <Badge
                                variant="outline"
                                className="mt-2 text-xs"
                              >
                                {image.category}
                              </Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>
             {filteredImages?.length === 0 && !isLoading && (
                <div className="text-center col-span-full py-10">
                    <p className="text-muted-foreground">No images found in this category.</p>
                </div>
            )}
        </div>

        {selectedImage && (
            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-3xl p-2">
                   <DialogHeader>
                        <DialogTitle className="sr-only">Enlarged Image</DialogTitle>
                    </DialogHeader>
                   <Image 
                        src={selectedImage}
                        alt="Enlarged gallery image"
                        width={1200}
                        height={900}
                        className="w-full h-auto object-contain rounded-md"
                   />
                </DialogContent>
            </Dialog>
        )}
        </>
    );
}
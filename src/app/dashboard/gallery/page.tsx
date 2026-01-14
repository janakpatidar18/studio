"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useInventory } from "@/context/InventoryContext";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryPage() {
    const { inventoryItems } = useInventory();
    const { toast } = useToast();
    const isLoading = !inventoryItems;

    const handleUpload = () => {
        toast({
            title: "Upload Mock",
            description: "In a real app, this would open a file dialog to upload an image.",
        })
    }

    const doorImages = inventoryItems?.filter(p => p.type === 'Door') ?? [];
    const decorImages = inventoryItems?.filter(p => p.type === 'Sawn Timber') ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
            <h1 className="text-4xl font-bold font-headline">Door Gallery</h1>
            <p className="text-lg text-muted-foreground">
                A showcase of doors made in-house.
            </p>
        </div>
        <Button onClick={handleUpload}>
            <Upload className="mr-2 h-5 w-5" />
            Upload Image
        </Button>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {isLoading && Array.from({length: 8}).map((_, i) => (
            <Card key={i} className="overflow-hidden group shadow-lg">
                <CardContent className="p-0">
                    <Skeleton className="aspect-[3/4] w-full" />
                </CardContent>
            </Card>
        ))}
        {doorImages.map((image) => (
            <Card key={image.id} className="overflow-hidden group shadow-lg">
                <CardContent className="p-0">
                    <div className="aspect-[3/4] relative">
                         <Image 
                            src={image.image!}
                            alt={image.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            data-ai-hint="door wood"
                         />
                    </div>
                </CardContent>
            </Card>
        ))}
        {decorImages.map((image) => (
             <Card key={image.id} className="overflow-hidden group shadow-lg">
             <CardContent className="p-0">
                 <div className="aspect-[2/3] sm:aspect-[3/2] relative">
                      <Image 
                         src={image.image!}
                         alt={image.name}
                         fill
                         className="object-cover transition-transform duration-300 group-hover:scale-105"
                         sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                         data-ai-hint="timber wood"
                      />
                 </div>
             </CardContent>
         </Card>
        ))}
      </div>
    </div>
  );
}

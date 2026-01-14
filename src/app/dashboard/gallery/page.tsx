"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function GalleryPage() {
    const doorImages = PlaceHolderImages.filter(p => p.id.startsWith('door-'));
    const decorImages = PlaceHolderImages.filter(p => p.id.startsWith('sawn-'));
    const { toast } = useToast();

    const handleUpload = () => {
        toast({
            title: "Upload Mock",
            description: "In a real app, this would open a file dialog to upload an image.",
        })
    }
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Door Gallery</h1>
            <p className="text-muted-foreground">
                A showcase of doors made in-house.
            </p>
        </div>
        <Button onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
        </Button>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {doorImages.map((image) => (
            <Card key={image.id} className="overflow-hidden group shadow-lg">
                <CardContent className="p-0">
                    <div className="aspect-[3/4] relative">
                         <Image 
                            src={image.imageUrl}
                            alt={image.description}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            data-ai-hint={image.imageHint}
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
                         src={image.imageUrl}
                         alt={image.description}
                         fill
                         className="object-cover transition-transform duration-300 group-hover:scale-105"
                         sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                         data-ai-hint={image.imageHint}
                      />
                 </div>
             </CardContent>
         </Card>
        ))}
      </div>
    </div>
  );
}

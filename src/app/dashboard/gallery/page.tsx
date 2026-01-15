
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/context/InventoryContext";
import { PlusCircle, Upload, X } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function AddToGalleryDialog({ children }: { children: React.ReactNode }) {
    const { addGalleryImage } = useInventory();
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // 80% quality JPEG
                        setImagePreview(dataUrl);
                    }
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const image = imagePreview;

        if (!image) {
            toast({
                title: "Image Required",
                description: "Please upload an image for the gallery.",
                variant: "destructive",
            });
            return;
        }

        if (!title) {
            toast({
                title: "Title Required",
                description: "Please provide a title for the image.",
                variant: "destructive",
            });
            return;
        }

        await addGalleryImage({ title, description, image });

        toast({
            title: "Image Added",
            description: "The image has been successfully added to the gallery.",
        });

        (e.target as HTMLFormElement).reset();
        setImagePreview(null);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Add Image to Gallery</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="gallery-image">Image</Label>
                        <Input id="gallery-image" name="gallery-image" type="file" accept="image/*" onChange={handleImageChange} required className="h-auto p-0 file:h-12 file:px-4 file:border-0"/>
                        {imagePreview && (
                            <div className="relative mt-4">
                                <Image src={imagePreview} alt="Image preview" width={400} height={300} className="w-full h-auto rounded-md object-contain" />
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 bg-background/50 hover:bg-background/80" onClick={() => setImagePreview(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="e.g., Custom Teak Door" required />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea id="description" name="description" placeholder="A brief description of the image..." />
                    </div>
                    <Button type="submit" className="w-full">Add to Gallery</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function GalleryPage() {
    const { galleryImages } = useInventory();
    const isLoading = galleryImages === null;
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <>
        <div className="space-y-8">
            <header className="flex flex-wrap items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold font-headline">Product Gallery</h1>
                    <p className="text-lg text-muted-foreground">
                        A showcase of our finest handcrafted products.
                    </p>
                </div>
                 <AddToGalleryDialog>
                    <Button>
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add Image to Gallery
                    </Button>
                </AddToGalleryDialog>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {isLoading && Array.from({length: 8}).map((_, i) => (
                    <Card key={i} className="overflow-hidden group shadow-lg">
                        <CardContent className="p-0">
                            <Skeleton className="aspect-[4/3] w-full" />
                        </CardContent>
                    </Card>
                ))}
                {galleryImages?.map((image) => (
                    <Card key={image.id} className="overflow-hidden group shadow-lg flex flex-col cursor-pointer" onClick={() => setSelectedImage(image.image)}>
                        <CardHeader className="p-0">
                             <div className="aspect-[4/3] relative">
                                <Image 
                                    src={image.image!}
                                    alt={image.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    data-ai-hint="product wood"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                             <CardTitle className="text-xl leading-tight font-semibold">{image.title}</CardTitle>
                             {image.description && <p className="text-sm text-muted-foreground mt-1">{image.description}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        {selectedImage && (
            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-4xl p-2">
                   <Image 
                        src={selectedImage}
                        alt="Enlarged gallery image"
                        width={1600}
                        height={1200}
                        className="w-full h-auto object-contain rounded-md"
                   />
                </DialogContent>
            </Dialog>
        )}
        </>
    );
}

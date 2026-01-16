
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/context/InventoryContext";
import { Edit, PlusCircle, Trash2, Upload, X, Download, Filter } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GalleryImage } from "@/lib/data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Helper to convert file to data URI
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        const img = new (window.Image)();
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
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            } else {
                reject(new Error('Failed to get canvas context.'));
            }
        };
        img.onerror = reject;
        img.src = reader.result as string;
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
});


function AddToGalleryDialog({ children }: { children: React.ReactNode }) {
    const { addGalleryImage, galleryCategories } = useInventory();
    const { toast } = useToast();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const resetForm = () => {
        setImageFile(null);
        setImagePreview(null);
        setOpen(false);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const category = formData.get("category") as string;

        if (!imageFile) {
            toast({
                title: "Image Required",
                description: "Please upload an image for the gallery.",
                variant: "destructive",
            });
            return;
        }

        if (!title || !category) {
            toast({
                title: "All Fields Required",
                description: "Please provide a title and category for the image.",
                variant: "destructive",
            });
            return;
        }

        try {
            const image = await toBase64(imageFile);
            await addGalleryImage({ title, category, image });

            toast({
                title: "Image Added",
                description: "The image has been successfully added to the gallery.",
            });
            
            (e.target as HTMLFormElement).reset();
            resetForm();

        } catch (error) {
             toast({
                title: "Error Processing Image",
                description: "There was a problem processing your image. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                resetForm();
            }
            setOpen(isOpen);
        }}>
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
                            <div className="relative mt-4 max-h-[300px] overflow-hidden rounded-md">
                                <Image src={imagePreview} alt="Image preview" width={400} height={300} className="w-full h-auto rounded-md object-contain" />
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 bg-background/50 hover:bg-background/80" onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                    const input = document.getElementById('gallery-image') as HTMLInputElement;
                                    if(input) input.value = '';
                                }}>
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
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" required>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {galleryCategories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full">Add to Gallery</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditGalleryImageDialog({ image, children }: { image: GalleryImage; children: React.ReactNode }) {
    const { updateGalleryImage, galleryCategories } = useInventory();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const category = formData.get("category") as string;

        if (!title || !category) {
            toast({
                title: "All Fields Required",
                description: "Please provide a title and category.",
                variant: "destructive",
            });
            return;
        }

        try {
            await updateGalleryImage(image.id, { title, category });
            toast({
                title: "Image Updated",
                description: "The image details have been successfully updated.",
            });
            setOpen(false);
        } catch (error) {
             toast({
                title: "Error Updating Image",
                description: "There was a problem updating your image. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Edit Image Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative mt-4 max-h-[300px] overflow-hidden rounded-md">
                        <Image src={image.image} alt={image.title} width={400} height={300} className="w-full h-auto rounded-md object-contain" />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input id="edit-title" name="title" defaultValue={image.title} required />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="edit-category">Category</Label>
                        <Select name="category" defaultValue={image.category} required>
                            <SelectTrigger id="edit-category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {galleryCategories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full">Save Changes</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function GalleryPage() {
    const { galleryImages, deleteGalleryImage, galleryCategories } = useInventory();
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const isLoading = galleryImages === null;

    const filteredImages =
        selectedCategory === "All"
        ? galleryImages
        : galleryImages?.filter((item) => item.category === selectedCategory);

    const handleDelete = async (imageId: string, imageTitle: string) => {
        await deleteGalleryImage(imageId);
        toast({
            title: "Image Deleted",
            description: `"${imageTitle}" has been removed from the gallery.`,
            variant: "destructive"
        })
    }

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
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                    <AddToGalleryDialog>
                        <Button className="w-full sm:w-auto flex-shrink-0">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Add Image
                        </Button>
                    </AddToGalleryDialog>
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
                             <div className="aspect-[2/4] relative" onClick={() => !isEditMode && setSelectedImage(image.image)}>
                                <Image 
                                    src={image.image!}
                                    alt={image.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    data-ai-hint="product wood"
                                />
                            </div>
                            <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                                <a
                                    href={image.image}
                                    download={`${image.title.replace(/\s+/g, '_')}.jpg`}
                                >
                                    <Button variant="secondary" size="icon" className="h-9 w-9">
                                        <Download className="w-4 h-4" />
                                        <span className="sr-only">Download Image</span>
                                    </Button>
                                </a>
                                {isEditMode && (
                                    <>
                                        <EditGalleryImageDialog image={image}>
                                            <Button variant="secondary" size="icon" className="h-9 w-9">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </EditGalleryImageDialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" className="h-9 w-9">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the
                                                    image "{image.title}" from your gallery.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(image.id, image.title)}>
                                                    Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow" onClick={() => !isEditMode && setSelectedImage(image.image)}>
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

        <Button
            onClick={() => setIsEditMode(!isEditMode)}
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-20 md:bottom-6 md:right-6"
            size="icon"
            variant={isEditMode ? "destructive" : "default"}
        >
            {isEditMode ? <X className="h-7 w-7" /> : <Edit className="h-7 w-7" />}
            <span className="sr-only">Toggle Edit Mode</span>
        </Button>
        </>
    );
}

    
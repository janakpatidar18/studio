"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, Unlock, KeyRound, Edit, X } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GalleryImage } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

const ADMIN_PIN = "1234"; // A real app should use a more secure method

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

function AdminCategoryManager() {
    const { galleryCategories, addGalleryCategory, removeGalleryCategory } = useInventory();
    const [newCategory, setNewCategory] = useState("");
    const { toast } = useToast();

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            toast({ title: "Category name cannot be empty", variant: "destructive" });
            return;
        }
        const result = await addGalleryCategory(newCategory);
        if (result.success) {
            toast({ title: "Category Added", description: `"${newCategory}" has been added.` });
            setNewCategory("");
        } else {
            toast({ title: "Failed to Add", description: result.message, variant: "destructive" });
        }
    };

    const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
        const result = await removeGalleryCategory(categoryId);
        if (result.success) {
            toast({ title: "Category Removed", description: `"${categoryName}" has been removed.`, variant: "destructive" });
        } else {
            toast({ title: "Failed to Remove", description: result.message, variant: "destructive" });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Add or remove gallery categories.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                    <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category name"
                    />
                    <Button type="submit">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add
                    </Button>
                </form>
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Existing Categories</h3>
                    <div className="border rounded-md p-2 space-y-2 max-h-60 overflow-y-auto">
                        {galleryCategories && galleryCategories.length > 0 ? (
                            galleryCategories.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                    <span>{cat.name}</span>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                   This will remove the category "{cat.name}". This action cannot be undone. Make sure no images are using this category.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteCategory(cat.id, cat.name)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-center text-muted-foreground py-4">No categories found.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function AdminImageManager() {
    const { galleryImages, deleteGalleryImage, galleryCategories } = useInventory();
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState("All");
    
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
        <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Manage Gallery Images</CardTitle>
                    <CardDescription>Add, edit, or delete gallery images.</CardDescription>
                </div>
                <AddToGalleryDialog>
                    <Button className="w-full sm:w-auto flex-shrink-0">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add Image
                    </Button>
                </AddToGalleryDialog>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoading}>
                        <SelectTrigger id="category-filter" className="w-full sm:w-[300px]">
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
                                <div className="aspect-[2/4] relative">
                                    <Image 
                                        src={image.image!}
                                        alt={image.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        data-ai-hint="product wood"
                                    />
                                </div>
                                <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
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
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <CardTitle className="text-base sm:text-lg leading-tight font-semibold">{image.title}</CardTitle>
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
                        <p className="text-muted-foreground">No images found for this category.</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}


export default function AdminPage() {
    const [pin, setPin] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();
    
    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
            setError('');
            toast({
                title: "Access Granted",
                description: "Welcome to the Admin Panel.",
            });
        } else {
            setError('Invalid PIN. Please try again.');
            setPin('');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <KeyRound className="w-6 h-6" /> Admin Access
                        </CardTitle>
                        <CardDescription>Please enter the admin PIN to continue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePinSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pin">Admin PIN</Label>
                                <Input
                                    id="pin"
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="••••"
                                    maxLength={4}
                                    inputMode="numeric"
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Button type="submit" className="w-full">
                                <Unlock className="mr-2 h-4 w-4" /> Unlock
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">Admin Panel</h1>
                <p className="text-md sm:text-lg text-muted-foreground">
                    Manage your application settings.
                </p>
            </header>
            <AdminCategoryManager />
            <AdminImageManager />
        </div>
    );
}

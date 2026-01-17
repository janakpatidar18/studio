"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, Unlock, KeyRound } from 'lucide-react';
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

const ADMIN_PIN = "1234"; // A real app should use a more secure method

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
        </div>
    );
}

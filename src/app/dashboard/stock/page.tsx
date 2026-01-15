
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, FolderPlus, ImageIcon, PackagePlus, PlusCircle, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
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
import { useInventory } from "@/context/InventoryContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InventoryItem } from "@/lib/data";
import Image from "next/image";


function EditProductDialog({ product, children }: { product: InventoryItem; children: React.ReactNode }) {
    const { updateProduct, categories } = useInventory();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(product.image || null);
    const [isNewImage, setIsNewImage] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsNewImage(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new (window.Image)();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
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
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
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
        const name = formData.get('product-name') as string;
        const type = formData.get('product-type') as string;
        const sellingPrice = Number(formData.get('selling-price'));
        
        const productData: Partial<InventoryItem> = {
            name,
            type,
            sellingPrice,
        };

        if (isNewImage) {
            productData.image = imagePreview ?? undefined;
        }

        await updateProduct(product.id, productData);
        
        toast({
            title: "Product Updated",
            description: `${name} has been successfully updated.`,
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="edit-product-image">Product Image</Label>
                            <Input id="edit-product-image" name="edit-product-image" type="file" accept="image/*" onChange={handleImageChange} className="mt-3 h-auto p-0 file:h-12 file:px-4 file:border-0" />
                            {imagePreview && <Image src={imagePreview} alt="Image preview" width={300} height={300} className="mt-4 w-full h-auto rounded-md object-contain max-h-48" />}
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="edit-product-name">Product Name</Label>
                                <Input id="edit-product-name" name="product-name" type="text" defaultValue={product.name} required />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="edit-product-type">Product Type</Label>
                                <Select name="product-type" defaultValue={product.type} required>
                                    <SelectTrigger id="edit-product-type">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="edit-selling-price">Selling Price (₹)</Label>
                            <Input id="edit-selling-price" name="selling-price" type="number" defaultValue={product.sellingPrice} min="0" step="0.01" required />
                        </div>
                    </div>
                    <Button type="submit" className="w-full">Save Changes</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function StockManagementPage() {
  const { toast } = useToast();
  const { 
    inventoryItems, 
    addProduct, 
    deleteProduct,
    updateStock,
    categories,
    addCategory,
    removeCategory,
    galleryCategories,
    addGalleryCategory,
    removeGalleryCategory
  } = useInventory();
  const [newCategory, setNewCategory] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleAddStock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemId = formData.get('item') as string;
    const quantity = Number(formData.get('quantity'));
    const itemName = inventoryItems?.find(i => i.id === itemId)?.name;

    if (!itemId || !quantity) {
        toast({
            title: "Invalid Input",
            description: "Please select an item and enter a quantity.",
            variant: "destructive",
        });
        return;
    }

    const result = await updateStock(itemId, quantity, 'add');

    if (result.success) {
        toast({
            title: `Stock Added`,
            description: `${quantity} units of ${itemName} have been processed.`,
        });
        (e.target as HTMLFormElement).reset();
    } else {
        toast({
            title: `Error Adding Stock`,
            description: result.message,
            variant: "destructive",
        });
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('product-name') as string;
    const type = formData.get('product-type') as string;
    const quantity = Number(formData.get('opening-stock'));
    const sellingPrice = Number(formData.get('selling-price'));
    const image = imagePreview;

    if (!image) {
      toast({
        title: "Image Required",
        description: "Please upload an image for the product.",
        variant: "destructive",
      });
      return;
    }
    
    await addProduct({
        name,
        type,
        quantity,
        sellingPrice,
        image,
    });
    
    toast({
        title: "Product Added",
        description: `${name} has been added to the inventory.`,
    });
    (e.target as HTMLFormElement).reset();
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
            setImagePreview(dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
    toast({
      title: "Product Deleted",
      description: "The product has been removed from the inventory.",
      variant: 'destructive'
    });
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      const result = await addCategory(newCategory.trim());
      if (result.success) {
        setNewCategory('');
        toast({
          title: 'Product Category Added',
          description: `Category "${newCategory.trim()}" has been added.`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        })
      }
    }
  };

  const handleRemoveCategory = async (categoryToRemove: string) => {
    const result = await removeCategory(categoryToRemove);
    if(result.success) {
      const categoryName = categories?.find(c => c.id === categoryToRemove)?.name;
      toast({
        title: 'Product Category Removed',
        description: `Category "${categoryName}" has been removed.`,
        variant: 'destructive',
      });
    } else {
       toast({
        title: 'Cannot Remove Category',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddGalleryCategory = async () => {
    if (newGalleryCategory.trim()) {
      const result = await addGalleryCategory(newGalleryCategory.trim());
      if (result.success) {
        setNewGalleryCategory('');
        toast({
          title: 'Gallery Category Added',
          description: `Category "${newGalleryCategory.trim()}" has been added.`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        })
      }
    }
  };

  const handleRemoveGalleryCategory = async (categoryToRemove: string) => {
    const result = await removeGalleryCategory(categoryToRemove);
    if(result.success) {
      const categoryName = galleryCategories?.find(c => c.id === categoryToRemove)?.name;
      toast({
        title: 'Gallery Category Removed',
        description: `Category "${categoryName}" has been removed.`,
        variant: 'destructive',
      });
    } else {
       toast({
        title: 'Cannot Remove Category',
        description: result.message,
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold font-headline">Stock Management</h1>
        <p className="text-md sm:text-lg text-muted-foreground">
          Record stock inputs/outputs, add products, and manage categories.
        </p>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <PlusCircle className="text-accent w-7 h-7" />
              Add Stock
            </CardTitle>
            <CardDescription>
              Record new items or additional quantities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStock} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="add-item">Item</Label>
                <Select name="item" required>
                  <SelectTrigger id="add-item">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="add-quantity">Quantity</Label>
                <Input id="add-quantity" name="quantity" type="number" placeholder="0" min="1" required />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Add Stock</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <PackagePlus className="text-primary w-7 h-7" />
              Add New Product
            </CardTitle>
            <CardDescription>
              Add a completely new product to the inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="product-image">Product Image</Label>
                    <Input id="product-image" name="product-image" type="file" accept="image/*" onChange={handleImageChange} required className="mt-3 h-auto p-0 file:h-12 file:px-4 file:border-0"/>
                    {imagePreview && <img src={imagePreview} alt="Image preview" className="mt-4 w-full h-auto rounded-md object-contain max-h-48" />}
                  </div>
                  <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input id="product-name" name="product-name" type="text" placeholder="e.g., Cherry Wood" required />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="product-type">Product Category</Label>
                        <Select name="product-type" required>
                          <SelectTrigger id="product-type">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((cat) => (
                               <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="selling-price">Selling Price (₹)</Label>
                    <Input id="selling-price" name="selling-price" type="number" placeholder="0.00" min="0" step="0.01" required />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="opening-stock">Opening Stock</Label>
                    <Input id="opening-stock" name="opening-stock" type="number" placeholder="0" min="0" required />
                  </div>
              </div>
              <Button type="submit" className="w-full">Add Product</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FolderPlus className="text-primary w-7 h-7" />
              Manage Product Categories
            </CardTitle>
            <CardDescription>
              Add or remove product categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div>
                  <Label htmlFor="new-category">Add New Category</Label>
                  <div className="flex gap-2 mt-3">
                      <Input 
                          id="new-category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="e.g., Tools"
                      />
                      <Button onClick={handleAddCategory} size="sm">Add</Button>
                  </div>
              </div>
              <div className="space-y-3">
                  <Label>Existing Categories</Label>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {categories?.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                            <span className="font-medium">{cat.name}</span>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRemoveCategory(cat.id)}>
                                <XCircle className="h-5 w-5 text-destructive" />
                            </Button>
                        </div>
                    ))}
                  </div>
              </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <ImageIcon className="text-primary w-7 h-7" />
              Manage Gallery Categories
            </CardTitle>
            <CardDescription>
              Add or remove categories for the gallery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div>
                  <Label htmlFor="new-gallery-category">Add New Category</Label>
                  <div className="flex gap-2 mt-3">
                      <Input 
                          id="new-gallery-category"
                          value={newGalleryCategory}
                          onChange={(e) => setNewGalleryCategory(e.target.value)}
                          placeholder="e.g., Custom Furniture"
                      />
                      <Button onClick={handleAddGalleryCategory} size="sm">Add</Button>
                  </div>
              </div>
              <div className="space-y-3">
                  <Label>Existing Categories</Label>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {galleryCategories?.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                            <span className="font-medium">{cat.name}</span>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRemoveGalleryCategory(cat.id)}>
                                <XCircle className="h-5 w-5 text-destructive" />
                            </Button>
                        </div>
                    ))}
                  </div>
              </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Trash2 className="text-destructive w-7 h-7"/>
              Manage Products
            </CardTitle>
            <CardDescription>
              Edit or delete products from the inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {inventoryItems?.map(item => (
                  <li key={item.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.type} - {item.quantity} in stock</p>
                    </div>
                    <div className="flex gap-2">
                      <EditProductDialog product={item}>
                          <Button variant="outline" size="icon">
                              <Edit className="h-5 w-5"/>
                          </Button>
                      </EditProductDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-5 w-5"/>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              product "{item.name}" from your inventory.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(item.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

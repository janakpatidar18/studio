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
import { InventoryItem } from "@/lib/data";
import { Box, Cog, MinusCircle, PlusCircle, PackagePlus, Trash2, FolderPlus, XCircle, ImagePlus } from "lucide-react";
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


export default function StockManagementPage() {
  const { toast } = useToast();
  const { 
    inventoryItems, 
    addProduct, 
    deleteProduct,
    updateStock,
    categories,
    addCategory,
    removeCategory 
  } = useInventory();
  const [newCategory, setNewCategory] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, type: 'add' | 'sell') => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemName = formData.get('item') as string;
    const quantity = Number(formData.get('quantity'));

    if (!itemName || !quantity) {
        toast({
            title: "Invalid Input",
            description: "Please select an item and enter a quantity.",
            variant: "destructive",
        });
        return;
    }

    const result = updateStock(itemName, quantity, type);

    if (result.success) {
        toast({
            title: `Stock ${type === 'add' ? 'Added' : 'Updated'}`,
            description: `${quantity} units of ${itemName} have been processed.`,
        });
        (e.target as HTMLFormElement).reset();
    } else {
        toast({
            title: `Error ${type === 'add' ? 'Adding' : 'Updating'} Stock`,
            description: result.message,
            variant: "destructive",
        });
    }
  };

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('product-name') as string;
    const type = formData.get('product-type') as 'Material' | 'Machinery';
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
    
    addProduct({
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
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    toast({
      title: "Product Deleted",
      description: "The product has been removed from the inventory.",
      variant: 'destructive'
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const result = addCategory(newCategory.trim());
      if (result.success) {
        setNewCategory('');
        toast({
          title: 'Category Added',
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

  const handleRemoveCategory = (categoryToRemove: string) => {
    const result = removeCategory(categoryToRemove);
    if(result.success) {
      toast({
        title: 'Category Removed',
        description: `Category "${categoryToRemove}" has been removed.`,
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
        <h1 className="text-4xl font-bold font-headline">Stock Management</h1>
        <p className="text-lg text-muted-foreground">
          Record stock inputs and outputs, add new products and manage categories.
        </p>
      </header>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <PlusCircle className="text-accent w-7 h-7" />
              Add Stock
            </CardTitle>
            <CardDescription className="text-base">
              Record new items or additional quantities coming into the inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, 'add')} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="add-item">Item</Label>
                <Select name="item" required>
                  <SelectTrigger id="add-item">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
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
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <MinusCircle className="text-destructive w-7 h-7" />
              Sell / Use Stock
            </CardTitle>
            <CardDescription className="text-base">
              Record items sold or used from the inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, 'sell')} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="sell-item">Item</Label>
                <Select name="item" required>
                  <SelectTrigger id="sell-item">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="sell-quantity">Quantity</Label>
                <Input id="sell-quantity" name="quantity" type="number" placeholder="0" min="1" required />
              </div>
              <Button type="submit" variant="destructive" className="w-full">Record Sale/Usage</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <PackagePlus className="text-primary w-7 h-7" />
              Add New Product
            </CardTitle>
            <CardDescription className="text-base">
              Add a completely new product to the inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-6">
               <div className="space-y-3">
                <Label htmlFor="product-image">Product Image</Label>
                <Input id="product-image" name="product-image" type="file" accept="image/*" onChange={handleImageChange} required className="h-auto p-0 file:h-12 file:px-4 file:border-0"/>
                {imagePreview && <img src={imagePreview} alt="Image preview" className="mt-4 w-full h-auto rounded-md" />}
              </div>
              <div className="space-y-3">
                <Label htmlFor="product-name">Product Name</Label>
                <Input id="product-name" name="product-name" type="text" placeholder="e.g., Cherry Wood" required />
              </div>
              <div className="space-y-3">
                <Label htmlFor="product-type">Product Type</Label>
                <Select name="product-type" required defaultValue="Material">
                  <SelectTrigger id="product-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                       <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="selling-price">Selling Price</Label>
                <Input id="selling-price" name="selling-price" type="number" placeholder="0.00" min="0" step="0.01" required />
              </div>
              <div className="space-y-3">
                <Label htmlFor="opening-stock">Opening Stock</Label>
                <Input id="opening-stock" name="opening-stock" type="number" placeholder="0" min="0" required />
              </div>
              <Button type="submit" className="w-full">Add Product</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FolderPlus className="text-primary w-7 h-7" />
              Manage Categories
            </CardTitle>
            <CardDescription className="text-base">
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
                  <div className="space-y-3">
                    {categories.map(cat => (
                        <div key={cat} className="flex items-center justify-between p-3 rounded-md bg-muted">
                            <span className="font-medium text-base">{cat}</span>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRemoveCategory(cat)}>
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
            <CardDescription className="text-base">
              Delete products from the inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <ul className="space-y-3">
                {inventoryItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between p-4 rounded-md bg-muted">
                    <div>
                      <p className="font-medium text-base">{item.name}</p>
                      <p className="text-base text-muted-foreground">{item.type} - {item.quantity} in stock</p>
                    </div>
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
                  </li>
                ))}
              </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

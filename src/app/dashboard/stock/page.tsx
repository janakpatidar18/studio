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
import { inventoryItems as initialInventoryItems, InventoryItem } from "@/lib/data";
import { Box, Cog, MinusCircle, PlusCircle, PackagePlus } from "lucide-react";
import { useState } from "react";

export default function StockManagementPage() {
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, type: 'add' | 'sell') => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const item = formData.get('item');
    const quantity = formData.get('quantity');

    toast({
        title: `Stock ${type === 'add' ? 'Added' : 'Sold'}`,
        description: `${quantity} units of ${item} have been processed. (This is a demo)`,
    });
    (e.target as HTMLFormElement).reset();
  };

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('product-name') as string;
    const type = formData.get('product-type') as 'Material' | 'Machinery';
    const quantity = Number(formData.get('opening-stock'));
    const sellingPrice = Number(formData.get('selling-price'));
    
    const newProduct: InventoryItem = {
        id: (inventoryItems.length + 1).toString(),
        name,
        type,
        icon: type === 'Machinery' ? Cog : Box,
        quantity,
        sellingPrice,
    };

    setInventoryItems(prevItems => [...prevItems, newProduct]);
    
    toast({
        title: "Product Added",
        description: `${name} has been added to the inventory. (This is a demo)`,
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Stock Management</h1>
        <p className="text-muted-foreground">
          Record stock inputs and outputs, and add new products.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="text-accent" />
              Add Stock
            </CardTitle>
            <CardDescription>
              Record new items or additional quantities coming into the inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, 'add')} className="space-y-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="add-quantity">Quantity</Label>
                <Input id="add-quantity" name="quantity" type="number" placeholder="0" min="1" required />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Add Stock</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MinusCircle className="text-destructive" />
              Sell / Use Stock
            </CardTitle>
            <CardDescription>
              Record items sold or used from the inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, 'sell')} className="space-y-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="sell-quantity">Quantity</Label>
                <Input id="sell-quantity" name="quantity" type="number" placeholder="0" min="1" required />
              </div>
              <Button type="submit" variant="destructive" className="w-full">Record Sale/Usage</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackagePlus className="text-primary" />
              Add New Product
            </CardTitle>
            <CardDescription>
              Add a completely new product to the inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input id="product-name" name="product-name" type="text" placeholder="e.g., Cherry Wood" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-type">Product Type</Label>
                <Select name="product-type" required defaultValue="Material">
                  <SelectTrigger id="product-type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Machinery">Machinery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling-price">Selling Price</Label>
                <Input id="selling-price" name="selling-price" type="number" placeholder="0.00" min="0" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opening-stock">Opening Stock</Label>
                <Input id="opening-stock" name="opening-stock" type="number" placeholder="0" min="0" required />
              </div>
              <Button type="submit" className="w-full">Add Product</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

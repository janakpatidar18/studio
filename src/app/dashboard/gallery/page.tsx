
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "@/lib/data";
import { useInventory } from "@/context/InventoryContext";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";


function RecordSaleDialog({ children }: { children: React.ReactNode }) {
    const { inventoryItems, updateStock } = useInventory();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

        const result = await updateStock(itemId, quantity, 'sell');

        if (result.success) {
            toast({
                title: `Sale Recorded`,
                description: `${quantity} units of ${itemName} have been sold.`,
            });
            (e.target as HTMLFormElement).reset();
            setOpen(false);
        } else {
            toast({
                title: `Error Recording Sale`,
                description: result.message,
                variant: "destructive",
            });
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                        <Receipt className="w-7 h-7" />
                        Record Sale / Use Stock
                    </DialogTitle>
                </DialogHeader>
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="sell-item">Item</Label>
                        <Select name="item" required>
                        <SelectTrigger id="sell-item">
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
                        <Label htmlFor="sell-quantity">Quantity</Label>
                        <Input id="sell-quantity" name="quantity" type="number" placeholder="0" min="1" required />
                    </div>
                    <Button type="submit" variant="destructive" className="w-full">Record Sale/Usage</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export default function InventoryPage() {
  const { inventoryItems, categories } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems =
    selectedCategory === "All"
      ? inventoryItems
      : inventoryItems?.filter((item) => item.type === selectedCategory);
  
  const isLoading = !inventoryItems;

  return (
    <>
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-headline">
            Inventory Overview
          </h1>
          <p className="text-md sm:text-lg text-muted-foreground">
            Current status of your stock and machinery.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoading}>
                <SelectTrigger id="category-filter" className="w-full sm:w-[300px] bg-accent/20 border-accent text-accent-foreground">
                    <SelectValue placeholder="Filter by Category..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {isLoading && Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden group shadow-lg flex flex-col">
              <CardHeader className="p-0">
                  <Skeleton className="aspect-square w-full" />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/2" />
              </CardContent>
              <CardFooter className="p-0 border-t mt-auto">
                  <div className="flex w-full text-center">
                      <div className="p-3 w-1/2">
                          <Skeleton className="h-4 w-10 mx-auto mb-1" />
                          <Skeleton className="h-5 w-16 mx-auto" />
                      </div>
                      <div className="p-3 w-1/2 border-l">
                          <Skeleton className="h-4 w-10 mx-auto mb-1" />
                          <Skeleton className="h-5 w-8 mx-auto" />
                      </div>
                  </div>
              </CardFooter>
          </Card>
        ))}
        {!isLoading && filteredItems?.map((item: InventoryItem) => (
          <Card
            key={item.id}
            className="overflow-hidden group shadow-lg flex flex-col"
          >
            <CardHeader className="p-0">
              <div className="aspect-square relative">
                <Image
                  src={item.image ?? `https://picsum.photos/seed/${item.id}/600/600`}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  data-ai-hint="product photo"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-base sm:text-lg leading-tight">
                {item.name}
              </CardTitle>
              <Badge
                variant={item.type === "Machinery" ? "secondary" : "outline"}
                className="mt-2 text-xs"
              >
                {item.type}
              </Badge>
            </CardContent>
            <CardFooter className="p-0 border-t mt-auto text-sm sm:text-base">
              <div className="flex w-full text-center">
                <div className="p-3 w-1/2">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold">₹{item.sellingPrice.toFixed(2)}</p>
                </div>
                <div className="p-3 w-1/2 border-l">
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className="font-semibold">{item.quantity}</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>

    <RecordSaleDialog>
        <Button
            className="fixed bottom-24 right-4 h-16 w-16 rounded-full shadow-lg z-20 md:bottom-6 md:right-6"
            size="icon"
        >
            <Receipt className="h-8 w-8" />
            <span className="sr-only">Record Sale</span>
        </Button>
    </RecordSaleDialog>
    </>
  );
}

    
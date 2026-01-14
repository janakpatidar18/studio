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

export default function InventoryPage() {
  const { inventoryItems, categories } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems =
    selectedCategory === "All"
      ? inventoryItems
      : inventoryItems?.filter((item) => item.type === selectedCategory);
  
  const isLoading = !inventoryItems;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-headline">
            Inventory Overview
          </h1>
          <p className="text-lg text-muted-foreground">
            Current status of your stock and machinery.
          </p>
        </div>
        <div className="flex items-center gap-4">
            <Label htmlFor="category-filter" className="text-base font-medium">Filter by Category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoading}>
                <SelectTrigger id="category-filter" className="w-[240px]">
                    <SelectValue placeholder="Select a category" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {isLoading && Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden group shadow-lg flex flex-col">
              <CardHeader className="p-0">
                  <Skeleton className="aspect-square w-full" />
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-6 w-1/2" />
              </CardContent>
              <CardFooter className="p-0 border-t mt-auto">
                  <div className="flex w-full text-center">
                      <div className="p-4 w-1/2">
                          <Skeleton className="h-5 w-12 mx-auto mb-1" />
                          <Skeleton className="h-6 w-20 mx-auto" />
                      </div>
                      <div className="p-4 w-1/2 border-l">
                          <Skeleton className="h-5 w-12 mx-auto mb-1" />
                          <Skeleton className="h-6 w-10 mx-auto" />
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
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  data-ai-hint="product photo"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <CardTitle className="text-2xl leading-tight">
                {item.name}
              </CardTitle>
              <Badge
                variant={item.type === "Machinery" ? "secondary" : "outline"}
                className="mt-3"
              >
                {item.type}
              </Badge>
            </CardContent>
            <CardFooter className="p-0 border-t mt-auto text-lg">
              <div className="flex w-full text-center">
                <div className="p-4 w-1/2">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold">₹{item.sellingPrice.toFixed(2)}</p>
                </div>
                <div className="p-4 w-1/2 border-l">
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="font-semibold">{item.quantity}</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

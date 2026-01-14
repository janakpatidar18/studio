"use client";

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

export default function InventoryPage() {
  const { inventoryItems } = useInventory();
  
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Inventory Overview</h1>
        <p className="text-muted-foreground">
          Current status of your stock and machinery.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {inventoryItems.map((item: InventoryItem) => (
            <Card key={item.id} className="overflow-hidden group shadow-lg flex flex-col">
              <CardHeader className="p-0">
                 <div className="aspect-square relative">
                    <Image 
                        src={`https://picsum.photos/seed/${item.id}/400/400`}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                        data-ai-hint="product photo"
                    />
                 </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                <Badge variant={item.type === "Machinery" ? "secondary" : "outline"} className="mt-2 gap-2">
                    <item.icon className="w-3 h-3" />
                    {item.type}
                </Badge>
              </CardContent>
              <CardFooter className="p-0 border-t mt-auto">
                    <div className="flex w-full text-center">
                        <div className="p-2 w-1/2">
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="font-semibold">${item.sellingPrice.toFixed(2)}</p>
                        </div>
                        <div className="p-2 w-1/2 border-l">
                            <p className="text-xs text-muted-foreground">Stock</p>
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

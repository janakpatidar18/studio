"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "@/lib/data";
import { useInventory } from "@/context/InventoryContext";

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
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            A list of all items currently in stock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item: InventoryItem) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant={item.type === "Machinery" ? "secondary" : "outline"} className="gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${item.sellingPrice.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

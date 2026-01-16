
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { Plus, Trash2, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


const SawnWoodEntrySchema = z.object({
  commodity: z.string().min(1, "Commodity is required"),
  length: z.coerce.number().min(0.01, "Length must be positive"),
  width: z.coerce.number().min(0.01, "Width must be positive"),
  height: z.coerce.number().min(0.01, "Height must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

type SawnWoodEntry = z.infer<typeof SawnWoodEntrySchema> & { id: number; cft: number };

const RoundLogEntrySchema = z.object({
  commodity: z.string().min(1, "Commodity is required"),
  length: z.coerce.number().min(0.01, "Length must be positive"),
  girth: z.coerce.number().min(0.01, "Girth must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

type RoundLogEntry = z.infer<typeof RoundLogEntrySchema> & { id: number; cft: number };


function SawnWoodCalculator() {
  const initialFormState = { commodity: "", length: "", width: "", height: "", quantity: "1" };
  const [formValues, setFormValues] = useState(initialFormState);
  const [entries, setEntries] = useState<SawnWoodEntry[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFormChange = (field: string, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };
  
  const handleAddEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = SawnWoodEntrySchema.safeParse(formValues);
    
    if (!parsed.success) {
      setFormError(parsed.error.errors[0].message);
      return;
    }
    
    setFormError(null);
    const { length, width, height, quantity, commodity } = parsed.data;
    const cft = ((length * width * height) / 144);
    
    setEntries(prev => [...prev, {
        id: Date.now(),
        commodity,
        length,
        width,
        height,
        quantity,
        cft,
    }]);

    setFormValues(initialFormState);
  };

  const removeEntry = (id: number) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };
  
  const clearForm = () => {
      setFormValues(initialFormState);
      setFormError(null);
  }
  
  const { totalCft, totalQuantity } = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.totalCft += entry.cft * entry.quantity;
        acc.totalQuantity += entry.quantity;
        return acc;
      },
      { totalCft: 0, totalQuantity: 0 }
    );
  }, [entries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sawn Wood CFT Calculator</CardTitle>
        <CardDescription>Add multiple timber sizes to calculate the total cubic feet (CFT).</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleAddEntry} className="p-4 border rounded-lg bg-muted/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="space-y-1 lg:col-span-2 md:col-span-3">
                    <Label htmlFor="sawn-commodity">Commodity</Label>
                    <Input id="sawn-commodity" value={formValues.commodity} onChange={e => handleFormChange('commodity', e.target.value)} placeholder="e.g., Teak wood" />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="sawn-length">Length (ft)</Label>
                    <Input id="sawn-length" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} type="number" step="any" placeholder="e.g., 10" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="sawn-width">Width (in)</Label>
                    <Input id="sawn-width" value={formValues.width} onChange={e => handleFormChange('width', e.target.value)} type="number" step="any" placeholder="e.g., 6" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="sawn-height">Thickness (in)</Label>
                    <Input id="sawn-height" value={formValues.height} onChange={e => handleFormChange('height', e.target.value)} type="number" step="any" placeholder="e.g., 2" />
                </div>
                 <div className="space-y-1 md:col-span-2 lg:col-span-1">
                    <Label htmlFor="sawn-quantity">Quantity</Label>
                    <Input id="sawn-quantity" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} type="number" min="1" placeholder="e.g., 1" />
                </div>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
             <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={clearForm}>
                    <X className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button type="submit">
                    <Plus className="mr-2 h-4 w-4" /> Add Entry
                </Button>
            </div>
        </form>

        <div className="overflow-auto border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Commodity</TableHead>
                        <TableHead className="text-right">Length (ft)</TableHead>
                        <TableHead className="text-right">Width (in)</TableHead>
                        <TableHead className="text-right">Thickness (in)</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">CFT (Item)</TableHead>
                        <TableHead className="text-right">Total CFT</TableHead>
                        <TableHead className="w-20 text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">No entries added yet.</TableCell>
                        </TableRow>
                    ) : entries.map((entry, index) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell>{entry.commodity}</TableCell>
                        <TableCell className="text-right">{entry.length.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{entry.width.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{entry.height.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{entry.quantity}</TableCell>
                        <TableCell className="text-right">{entry.cft.toFixed(4)}</TableCell>
                        <TableCell className="text-right font-medium">{(entry.cft * entry.quantity).toFixed(4)}</TableCell>
                        <TableCell className="text-center">
                           <Button variant="ghost" size="icon" type="button" onClick={() => removeEntry(entry.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                             <Trash2 className="h-4 w-4" />
                             <span className="sr-only">Remove</span>
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
      {entries.length > 0 && (
          <CardFooter className="flex-col items-stretch p-4 border-t bg-muted/50 space-y-2">
            <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Total Quantity</span>
                <span className="font-bold">{totalQuantity}</span>
            </div>
            <div className="flex justify-between text-2xl">
                <span className="text-muted-foreground">Total CFT</span>
                <span className="font-bold font-headline text-primary">{totalCft.toFixed(4)}</span>
            </div>
          </CardFooter>
      )}
    </Card>
  );
}

function RoundLogsCalculator() {
    const initialFormState = { commodity: "", length: "", girth: "", quantity: "1" };
    const [formValues, setFormValues] = useState(initialFormState);
    const [entries, setEntries] = useState<RoundLogEntry[]>([]);
    const [formError, setFormError] = useState<string | null>(null);

    const handleFormChange = (field: string, value: string) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
        setFormError(null);
    };

    const handleAddEntry = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const parsed = RoundLogEntrySchema.safeParse(formValues);

        if (!parsed.success) {
            setFormError(parsed.error.errors[0].message);
            return;
        }

        setFormError(null);
        const { length, girth, quantity, commodity } = parsed.data;
        const cft = ((girth * girth * length) / 2304);

        setEntries(prev => [...prev, {
            id: Date.now(),
            commodity,
            length,
            girth,
            quantity,
            cft,
        }]);

        setFormValues(initialFormState);
    };

    const removeEntry = (id: number) => {
        setEntries(entries.filter(entry => entry.id !== id));
    };
    
    const clearForm = () => {
        setFormValues(initialFormState);
        setFormError(null);
    }

    const { totalCft, totalQuantity } = useMemo(() => {
        return entries.reduce(
          (acc, entry) => {
            acc.totalCft += entry.cft * entry.quantity;
            acc.totalQuantity += entry.quantity;
            return acc;
          },
          { totalCft: 0, totalQuantity: 0 }
        );
      }, [entries]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Round Logs CFT Calculator</CardTitle>
                <CardDescription>Add multiple log sizes to calculate the total CFT using the Hoppus formula.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <form onSubmit={handleAddEntry} className="p-4 border rounded-lg bg-muted/50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1 md:col-span-2 lg:col-span-2">
                            <Label htmlFor="log-commodity">Commodity</Label>
                            <Input id="log-commodity" value={formValues.commodity} onChange={e => handleFormChange('commodity', e.target.value)} placeholder="e.g., Pine wood" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="log-length">Length (ft)</Label>
                            <Input id="log-length" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} type="number" step="any" placeholder="e.g., 12" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor
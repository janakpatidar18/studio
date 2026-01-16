
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { Plus, Trash2, X, Edit, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const shreeIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAABpBJREFUeF7tnX+MFFUUx7/fFRdFESsqKlhRBERUUEBFQUEs2MCKha3gC7FCBCsW0B+LDRsLEQu2WNhYsdYGAoLYoIKN2GBFEASjYEQhgoCIIqgoi4iL4vD/95y8d8e9d/fuzL17N/cm+S/Jzc7ce+acc+69M/fOQZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSfdhJPAu8GfgQ+Ab4GXgS+B2tZ+3qfV3A5/H5UcUgVHgUuBB4Axgd7X/A/gC+A64AtgE/AG8pva/AXwIXAS+B14HfgU+A2YG669h8DNgR3W/BfYCvwGfAmeBB4EPgWdJ11kLPAk8p/b3A7cD3wGnAQVn5f/c3I/qPg5MA9YCLwF3AmeAm4HxwHpgKnAGmB1s/4/JzwO3A+eA84F+YBlwEHAicAowT7rWOkA+BPyl9l8B3gDuAA4B4+z8L/v5oNoPBmYDe4AfgGnAWOApYCBwV3J+Jg8C5wL9wCXAJOD84uN8BngM+E/t3w9cApwM/BJ4TqL91zB4K/B+tf/pwMvAlx2nLwS+CjwFfAL8GjgX2AYMBoYDRwI7gGnAOcWnzwX+BswH1gKvgWOBs4FZwMPAduAD4EPAVcAuwGlgA/AY8E/g/V2+Vj/1T+Xq9Vngn1P3T3IAPgDeV3t/AfzZkY+D/g08AewA9gGngWlAf+An4GnA4cT5p/1Hge9g90vM9oV5I3AaEAdMAu4JDM9Tz4HtwG7gWGAdsBY4H/g4/0kX92s5+0/G1m/yP+RnwK+BDwI/A2cC8z2WtwKPAQ8D/wI+A/4A/BP4QyJ/L/An4K+A65W+F7gd+K/w+lPgo1O3YtK/Jp/2p3o+VwQeBNYDu4FdwJ+J038L7C46Nnw9A3x8SgC7677L13rT2k9V+2bV/5016eW2/dI+5P3/aU/7p+X84gYAVgLHgVOB+YFpQAcwSLo2P+TlwN8BbwA/A/8K/AxcD/wA+C6wJvBwFf9z9q+X+4G/dWSG/9sL7K3xP8j/u+n8v6v6L1P7x2v1q2f/xXv9F+n9x0sF8E+l9jN1/2F+/hfw5yn6d8y+T7f7Z/r8r8V4f0oD+qfnL8z7v9H9h6n9D9T9D/f3v6D+n6TzP+Lg/S/n7z9k4P3v6vzPyfnf4u3/9Y/mP6Tif/R/k/+T/Y/9P2v+f+p//0v6nyTv/w//wH/4I/wH/sH/8A/8g//hH/iH/8U/8A/8h3/iH/iH/8U/8A/+h3/iH/iH/+I/+Icf5A/8gy/yB/6hF/kD/+BL/IEfchF/4B88kT/wB1/kD/wDz+QPfPAV/oH/4Iv8gb/wFX7An/iKv8gfeIMv8Af+wbf5A3/hS/yBf/Ap/oB/4Nv8gT/yWf6Bf+At/oF/4DP8gb/yGf6Bf/A+/oF/4K38gR/yYf6Bf/Ct/IEf8pF+yB/4A1/nD/yRT/MH/sGn+QM/8qV+yB/4E/8gP/A/gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/8gD/v1k+r6W8/sR/sZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSfo/9C89NFuP+y5dAAAAAElFTkSuQmCC';

const SawnWoodEntrySchema = z.object({
  length: z.coerce.number().min(0.01, "Length must be positive"),
  width: z.coerce.number().min(0.01, "Width must be positive"),
  height: z.coerce.number().min(0.01, "Height must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

type SawnWoodEntry = z.infer<typeof SawnWoodEntrySchema> & { id: number; cft: number };

const RoundLogEntrySchema = z.object({
  length: z.coerce.number().min(0.01, "Length must be positive"),
  girth: z.coerce.number().min(0.01, "Girth must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

type RoundLogEntry = z.infer<typeof RoundLogEntrySchema> & { id: number; cft: number };

const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (!form) return;

      const inputs = Array.from(form.querySelectorAll('input'));
      const currentIndex = inputs.indexOf(e.currentTarget);

      if (currentIndex > -1 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
      } else if (currentIndex === inputs.length - 1) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton instanceof HTMLElement) {
            submitButton.click();
        }
      }
    }
};

function SawnWoodCalculator() {
  const initialFormState = { length: "", width: "", height: "", quantity: "" };
  const [formValues, setFormValues] = useState(initialFormState);
  const [entries, setEntries] = useState<SawnWoodEntry[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleFormChange = (field: string, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = SawnWoodEntrySchema.safeParse(formValues);
    
    if (!parsed.success) {
      setFormError(parsed.error.errors[0].message);
      return;
    }
    
    setFormError(null);
    const { length, width, height, quantity } = parsed.data;
    const cft = ((length * width * height) / 144);
    
    if (editingId) {
        setEntries(prev => prev.map(entry => 
            entry.id === editingId 
            ? { ...entry, length, width, height, quantity, cft } 
            : entry
        ));
    } else {
        setEntries(prev => [...prev, {
            id: Date.now(),
            length,
            width,
            height,
            quantity,
            cft,
        }]);
    }

    clearForm();
    (e.currentTarget.elements[0] as HTMLInputElement)?.focus();
  };

  const handleEditClick = (entry: SawnWoodEntry) => {
    setEditingId(entry.id);
    setFormValues({
        length: String(entry.length),
        width: String(entry.width),
        height: String(entry.height),
        quantity: String(entry.quantity),
    });
    setFormError(null);
    (document.getElementById('sawn-length') as HTMLInputElement)?.focus();
  }

  const removeEntry = (id: number) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };
  
  const clearForm = () => {
      setFormValues(initialFormState);
      setFormError(null);
      setEditingId(null);
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

  const handleDownloadPdf = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.addImage(shreeIcon, 'PNG', (pageWidth / 2) - 15, 5, 30, 30);
    
    doc.setFontSize(18);
    doc.text("Sawn Wood CFT Calculation", pageWidth / 2, 45, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Date: ${dateStr}`, pageWidth / 2, 52, { align: 'center' });

    const tableColumn = ["#", "Length (ft)", "Width (in)", "Thickness (in)", "Qty", "CFT (Item)", "Total CFT"];
    const tableRows: (string | number)[][] = [];

    entries.forEach((entry, index) => {
        const rowData = [
            index + 1,
            entry.length.toFixed(2),
            entry.width.toFixed(2),
            entry.height.toFixed(2),
            entry.quantity,
            entry.cft.toFixed(4),
            (entry.cft * entry.quantity).toFixed(4)
        ];
        tableRows.push(rowData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        didDrawPage: function (data) {
            let str = `Page ${doc.internal.getNumberOfPages()}`;
            doc.setFontSize(10);
            doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text("Summary", 14, finalY + 15);
    doc.autoTable({
        body: [
            ["Total Quantity", totalQuantity],
            ["Total CFT", totalCft.toFixed(4)]
        ],
        startY: finalY + 20,
        theme: 'grid',
        styles: { fontStyle: 'bold' }
    });

    doc.save(`sawn-wood-cft_${today.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sawn Wood CFT Calculator</CardTitle>
        <CardDescription>Add multiple timber sizes to calculate the total cubic feet (CFT).</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleFormSubmit} className="p-4 border rounded-lg bg-muted/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                 <div className="space-y-1">
                    <Label htmlFor="sawn-length">Length (ft)</Label>
                    <Input id="sawn-length" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="e.g., 10" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="sawn-width">Width (in)</Label>
                    <Input id="sawn-width" value={formValues.width} onChange={e => handleFormChange('width', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="e.g., 6" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="sawn-height">Thickness (in)</Label>
                    <Input id="sawn-height" value={formValues.height} onChange={e => handleFormChange('height', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="e.g., 2" />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="sawn-quantity">Quantity</Label>
                    <Input id="sawn-quantity" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" placeholder="e.g., 1" />
                </div>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
             <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={clearForm}>
                    <X className="mr-2 h-4 w-4" /> {editingId ? 'Cancel' : 'Clear'}
                </Button>
                <Button type="submit">
                    <Plus className="mr-2 h-4 w-4" /> {editingId ? 'Update Entry' : 'Add Entry'}
                </Button>
            </div>
        </form>

        <div className="overflow-auto border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead className="text-right">Length (ft)</TableHead>
                        <TableHead className="text-right">Width (in)</TableHead>
                        <TableHead className="text-right">Thickness (in)</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">CFT (Item)</TableHead>
                        <TableHead className="text-right">Total CFT</TableHead>
                        <TableHead className="w-24 text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">No entries added yet.</TableCell>
                        </TableRow>
                    ) : entries.map((entry, index) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="text-right">{entry.length.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{entry.width.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{entry.height.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{entry.quantity}</TableCell>
                        <TableCell className="text-right">{entry.cft.toFixed(4)}</TableCell>
                        <TableCell className="text-right font-medium">{(entry.cft * entry.quantity).toFixed(4)}</TableCell>
                        <TableCell className="text-center">
                           <Button variant="ghost" size="icon" type="button" onClick={() => handleEditClick(entry)} className="text-muted-foreground hover:text-primary h-8 w-8">
                             <Edit className="h-4 w-4" />
                             <span className="sr-only">Edit</span>
                           </Button>
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
            <Button onClick={handleDownloadPdf} variant="outline" className="mt-2 w-full">
                <Download className="mr-2 h-4 w-4" />
                Download as PDF
            </Button>
          </CardFooter>
      )}
    </Card>
  );
}

function RoundLogsCalculator() {
    const initialFormState = { length: "", girth: "", quantity: "" };
    const [formValues, setFormValues] = useState(initialFormState);
    const [entries, setEntries] = useState<RoundLogEntry[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    const handleFormChange = (field: string, value: string) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
        setFormError(null);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const parsed = RoundLogEntrySchema.safeParse(formValues);

        if (!parsed.success) {
            setFormError(parsed.error.errors[0].message);
            return;
        }

        setFormError(null);
        const { length, girth, quantity } = parsed.data;
        const cft = ((girth * girth * length) / 2304);

        if (editingId) {
            setEntries(prev => prev.map(entry =>
                entry.id === editingId
                ? { ...entry, length, girth, quantity, cft }
                : entry
            ));
        } else {
            setEntries(prev => [...prev, {
                id: Date.now(),
                length,
                girth,
                quantity,
                cft,
            }]);
        }
        
        clearForm();
        (e.currentTarget.elements[0] as HTMLInputElement)?.focus();
    };

    const handleEditClick = (entry: RoundLogEntry) => {
        setEditingId(entry.id);
        setFormValues({
            length: String(entry.length),
            girth: String(entry.girth),
            quantity: String(entry.quantity),
        });
        setFormError(null);
        (document.getElementById('log-length') as HTMLInputElement)?.focus();
    }

    const removeEntry = (id: number) => {
        setEntries(entries.filter(entry => entry.id !== id));
    };
    
    const clearForm = () => {
        setFormValues(initialFormState);
        setFormError(null);
        setEditingId(null);
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

      const handleDownloadPdf = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.addImage(shreeIcon, 'PNG', (pageWidth / 2) - 15, 5, 30, 30);
    
        doc.setFontSize(18);
        doc.text("Round Logs CFT Calculation", pageWidth / 2, 45, { align: 'center' });
        doc.setFontSize(11);
        doc.text(`Date: ${dateStr}`, pageWidth / 2, 52, { align: 'center' });
    
        const tableColumn = ["#", "Length (ft)", "Girth (in)", "Qty", "CFT (Item)", "Total CFT"];
        const tableRows: (string | number)[][] = [];
    
        entries.forEach((entry, index) => {
            const rowData = [
                index + 1,
                entry.length.toFixed(2),
                entry.girth.toFixed(2),
                entry.quantity,
                entry.cft.toFixed(4),
                (entry.cft * entry.quantity).toFixed(4)
            ];
            tableRows.push(rowData);
        });
    
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            didDrawPage: function (data) {
                let str = `Page ${doc.internal.getNumberOfPages()}`;
                doc.setFontSize(10);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });
    
        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(12);
        doc.text("Summary", 14, finalY + 15);
        doc.autoTable({
            body: [
                ["Total Quantity", totalQuantity],
                ["Total CFT", totalCft.toFixed(4)]
            ],
            startY: finalY + 20,
            theme: 'grid',
            styles: { fontStyle: 'bold' }
        });
        
        doc.save(`round-logs-cft_${today.toISOString().split('T')[0]}.pdf`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Round Logs CFT Calculator</CardTitle>
                <CardDescription>Add multiple log sizes to calculate the total CFT using the Hoppus formula.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <form onSubmit={handleFormSubmit} className="p-4 border rounded-lg bg-muted/50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="log-length">Length (ft)</Label>
                            <Input id="log-length" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="e.g., 12" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="log-girth">Girth (in)</Label>
                            <Input id="log-girth" value={formValues.girth} onChange={e => handleFormChange('girth', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="e.g., 24" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="log-quantity">Quantity</Label>
                            <Input id="log-quantity" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" placeholder="e.g., 1" />
                        </div>
                    </div>
                    {formError && <p className="text-sm text-destructive">{formError}</p>}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={clearForm}>
                            <X className="mr-2 h-4 w-4" /> {editingId ? 'Cancel' : 'Clear'}
                        </Button>
                        <Button type="submit">
                            <Plus className="mr-2 h-4 w-4" /> {editingId ? 'Update Entry' : 'Add Entry'}
                        </Button>
                    </div>
                </form>

                <div className="overflow-auto border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead className="text-right">Length (ft)</TableHead>
                                <TableHead className="text-right">Girth (in)</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">CFT (Item)</TableHead>
                                <TableHead className="text-right">Total CFT</TableHead>
                                <TableHead className="w-24 text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No entries added yet.</TableCell>
                                </TableRow>
                            ) : entries.map((entry, index) => (
                              <TableRow key={entry.id}>
                                <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                <TableCell className="text-right">{entry.length.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{entry.girth.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{entry.quantity}</TableCell>
                                <TableCell className="text-right">{entry.cft.toFixed(4)}</TableCell>
                                <TableCell className="text-right font-medium">{(entry.cft * entry.quantity).toFixed(4)}</TableCell>
                                <TableCell className="text-center">
                                   <Button variant="ghost" size="icon" type="button" onClick={() => handleEditClick(entry)} className="text-muted-foreground hover:text-primary h-8 w-8">
                                     <Edit className="h-4 w-4" />
                                     <span className="sr-only">Edit</span>
                                   </Button>
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
                    <Button onClick={handleDownloadPdf} variant="outline" className="mt-2 w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download as PDF
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

export default function CalculatorPage() {
    return (
        <Tabs defaultValue="sawn-wood" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sawn-wood">Sawn Wood</TabsTrigger>
                <TabsTrigger value="round-logs">Round Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="sawn-wood">
                <SawnWoodCalculator />
            </TabsContent>
            <TabsContent value="round-logs">
                <RoundLogsCalculator />
            </TabsContent>
        </Tabs>
    )
}

    

    
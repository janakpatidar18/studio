
"use client";

import { useState, useMemo, useEffect, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { Plus, Trash2, X, Edit, FileDown, Share2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory } from "@/context/InventoryContext";
import { useIsMobile } from "@/hooks/use-mobile";


const SawnWoodEntrySchema = z.object({
  length: z.coerce.number().min(0.01, "Length must be positive"),
  width: z.coerce.number().min(0.01, "Width is required"),
  height: z.coerce.number().min(0.01, "Thickness is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  rate: z.preprocess((val) => val === "" ? undefined : val, z.coerce.number().min(0, "Rate must be non-negative").optional()),
});

type SawnWoodEntry = z.infer<typeof SawnWoodEntrySchema> & { id: number; cft: number; totalAmount: number };

const RoundLogEntrySchema = z.object({
  length: z.coerce.number().min(0.01, "Length must be positive"),
  girth: z.coerce.number().min(0.01, "Girth must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  rate: z.coerce.number().min(0, "Rate must be non-negative").optional(),
});

type RoundLogEntry = z.infer<typeof RoundLogEntrySchema> & { id: number; cft: number; totalAmount: number };

const BeadingPattiEntrySchema = z.object({
  size: z.string().min(1, "Size is required"),
  grade: z.string().optional(),
  length: z.coerce.number().min(0.01, "Length must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  bundle: z.preprocess((val) => val === "" ? undefined : val, z.coerce.number().int().min(1).optional()),
  rate: z.coerce.number().min(0, "Rate must be non-negative").optional(),
});

type BeadingPattiEntry = z.infer<typeof BeadingPattiEntrySchema> & { id: number; totalLength: number; totalAmount: number };


const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (!form) return;

      const inputs = Array.from(form.querySelectorAll('input, button[aria-haspopup="listbox"]'));
      const currentIndex = inputs.indexOf(e.currentTarget as any);
      
      if (currentIndex > -1 && currentIndex < inputs.length - 1) {
        (inputs[currentIndex + 1] as HTMLElement).focus();
      } else if (currentIndex === inputs.length - 1) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton instanceof HTMLElement) {
            submitButton.click();
        }
      }
    }
};

function SawnWoodCalculator() {
  const initialFormState = { length: "", width: "", height: "", quantity: "", rate: "" };
  const [formValues, setFormValues] = useState(initialFormState);
  const [entries, setEntries] = useState<SawnWoodEntry[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [lastUsedRate, setLastUsedRate] = useState("");

  useLayoutEffect(() => {
    if (!editingId) {
      setFormValues(prev => ({ ...prev, rate: lastUsedRate }));
    }
  }, [lastUsedRate, editingId]);

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
    const { length, width, height, quantity, rate } = parsed.data;
    const cft = ((length * width * height) / 144);
    const totalAmount = cft * quantity * (rate || 0);

    if (rate !== undefined) {
      setLastUsedRate(String(rate));
    }
    
    if (editingId) {
        setEntries(prev => prev.map(entry => 
            entry.id === editingId 
            ? { ...entry, length, width, height, quantity, cft, rate, totalAmount } 
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
            rate,
            totalAmount
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
        rate: String(entry.rate ?? ''),
    });
    setFormError(null);
    (document.getElementById('sawn-length') as HTMLInputElement)?.focus();
  }

  const removeEntry = (id: number) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };
  
  const clearForm = () => {
      setFormValues({ ...initialFormState, rate: lastUsedRate });
      setFormError(null);
      setEditingId(null);
  }
  
  const { totalCft, totalQuantity, totalAmount } = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.totalCft += entry.cft * entry.quantity;
        acc.totalQuantity += entry.quantity;
        acc.totalAmount += entry.totalAmount;
        return acc;
      },
      { totalCft: 0, totalQuantity: 0, totalAmount: 0 }
    );
  }, [entries]);

  const generateSawnWoodPdfDoc = (customerName: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 22;

    doc.setFontSize(20);
    doc.text("SVLSM Timber Pro - Sawn Wood", pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;

    if (customerName) {
        doc.setFontSize(12);
        doc.text(`Customer: ${customerName}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 6;
    }
    
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 7;

    (doc as any).autoTable({
        head: [['#', 'Dimensions (L×W×T)', 'Qty', 'Rate', 'Total CFT', 'Total Amt']],
        body: entries.map((entry, index) => [
            index + 1,
            `${entry.length}" × ${entry.width}' × ${entry.height}'`,
            entry.quantity,
            entry.rate?.toFixed(2) ?? '-',
            (entry.cft * entry.quantity).toFixed(4),
            `Rs. ${entry.totalAmount.toFixed(2)}`,
        ]),
        startY: currentY,
        headStyles: { fillColor: [36, 69, 76] },
        theme: 'grid',
        styles: { halign: 'right' },
        columnStyles: {
            0: { halign: 'center' },
            1: { halign: 'left' },
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.autoTable({
        body: [
            ['Total Nos.', `${totalQuantity}`],
            ['Total CFT', `${totalCft.toFixed(4)}`],
            ['Grand Total', `Rs. ${totalAmount.toFixed(2)}`],
        ],
        startY: finalY + 5,
        theme: 'plain',
        bodyStyles: {
            fontStyle: 'bold',
            fontSize: 12,
        },
        columnStyles: {
            0: { halign: 'right' },
            1: { halign: 'right' },
        }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            'SVLSM Timber Pro',
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    return doc;
  };

  const handleDownloadPdf = () => {
    const doc = generateSawnWoodPdfDoc(customerName);
    const fileName = customerName.trim() ? `${customerName.trim()}.pdf` : `SawnWood_${totalCft.toFixed(4)}CFT.pdf`;
    doc.save(fileName);
  };
  
  const handleSharePdf = async () => {
    const doc = generateSawnWoodPdfDoc(customerName);
    const pdfBlob = doc.output('blob');
    const fileName = customerName.trim() ? `${customerName.trim()}.pdf` : `SawnWood_${totalCft.toFixed(4)}CFT.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'SVLSM Timber Pro - Sawn Wood',
                text: `Sawn Wood CFT calculation for ${customerName.trim() || 'your project'}.`,
                files: [pdfFile],
            });
        } catch (error) {
            console.log('Sharing failed, falling back to download', error);
            handleDownloadPdf();
        }
    } else {
        handleDownloadPdf();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sawn Wood</CardTitle>
        <CardDescription>Add multiple timber sizes to calculate the total cubic feet (CFT).</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 space-y-4">
        <form onSubmit={handleFormSubmit} className="hidden md:block p-2 sm:p-4 border rounded-lg bg-muted/50 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="sawn-length">Length (ft)</Label>
                    <Input id="sawn-length" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="sawn-width">Width (in)</Label>
                    <Input id="sawn-width" value={formValues.width} onChange={e => handleFormChange('width', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="sawn-height">Thickness (in)</Label>
                    <Input id="sawn-height" value={formValues.height} onChange={e => handleFormChange('height', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="" />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="sawn-quantity">Quantity</Label>
                    <Input id="sawn-quantity" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" placeholder="" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="sawn-rate">Rate</Label>
                    <Input id="sawn-rate" value={formValues.rate} onChange={e => handleFormChange('rate', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="per CFT" />
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

        <div className="overflow-x-auto border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center px-2">#</TableHead>
                        <TableHead className="px-2">Dimensions</TableHead>
                        <TableHead className="text-right px-2">Qty</TableHead>
                        <TableHead className="text-right px-2">Rate</TableHead>
                        <TableHead className="text-right px-2">Total CFT</TableHead>
                        <TableHead className="text-right px-2">Total Amt</TableHead>
                        <TableHead className="w-28 text-center px-2">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground p-4">No entries added yet.</TableCell>
                        </TableRow>
                    ) : entries.map((entry, index) => (
                      <TableRow key={entry.id}>
                        <TableCell className="p-2 text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="p-2">
                            <div className="font-medium whitespace-normal">{entry.length}" × {entry.width}' × {entry.height}'</div>
                            <div className="text-xs text-muted-foreground">Item CFT: {entry.cft.toFixed(4)}</div>
                        </TableCell>
                        <TableCell className="p-2 text-right">{entry.quantity}</TableCell>
                        <TableCell className="p-2 text-right">{entry.rate?.toFixed(2) ?? '-'}</TableCell>
                        <TableCell className="p-2 text-right font-medium">{(entry.cft * entry.quantity).toFixed(4)}</TableCell>
                        <TableCell className="p-2 text-right font-bold">Rs. {entry.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="p-2 text-center">
                          <div className="flex items-center justify-center">
                            <Button variant="ghost" size="icon" type="button" onClick={() => handleEditClick(entry)} className="text-muted-foreground hover:text-primary h-8 w-8">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" type="button" onClick={() => removeEntry(entry.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
      {entries.length > 0 && (
          <CardFooter className="flex-col items-stretch p-2 sm:p-6 border-t bg-muted/50 space-y-2">
            <div className="flex justify-between text-base sm:text-lg">
                <span className="text-muted-foreground">Total Nos.</span>
                <span className="font-bold">{totalQuantity}</span>
            </div>
            <div className="flex justify-between text-xl sm:text-2xl">
                <span className="text-muted-foreground">Total CFT</span>
                <span className="font-bold font-headline">{totalCft.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-2xl sm:text-3xl">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold font-headline text-primary">Rs. {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button onClick={handleDownloadPdf} variant="outline">
                    <FileDown className="mr-2 h-4 w-4" /> Download PDF
                </Button>
                <Button onClick={handleSharePdf}>
                    <Share2 className="mr-2 h-4 w-4" /> Share PDF
                </Button>
            </div>
            <div className="space-y-2 pt-4">
                <Label htmlFor="sawn-customer-name">Customer Name (for PDF)</Label>
                <Input 
                    id="sawn-customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Optional: Enter name for PDF filename"
                    className="h-11"
                />
            </div>
          </CardFooter>
      )}
      <div className="h-44 md:hidden"></div>
      <form onSubmit={handleFormSubmit} className="fixed bottom-20 left-0 right-0 z-40 p-2 bg-background/80 backdrop-blur-sm border-t md:hidden">
        <div className="max-w-xl mx-auto p-2 rounded-lg bg-card/90 border-2 border-primary/50">
            <div className="flex items-end gap-2">
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-2 pr-2">
                        <div className="space-y-1 w-20 shrink-0">
                            <Label htmlFor="sawn-length-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Length (ft)</Label>
                            <Input id="sawn-length-float" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center text-base" />
                        </div>
                        <div className="space-y-1 w-24 shrink-0">
                            <Label htmlFor="sawn-width-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Width (in)</Label>
                            <Input id="sawn-width-float" value={formValues.width} onChange={e => handleFormChange('width', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center text-base" />
                        </div>
                        <div className="space-y-1 w-24 shrink-0">
                            <Label htmlFor="sawn-height-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Thick (in)</Label>
                            <Input id="sawn-height-float" value={formValues.height} onChange={e => handleFormChange('height', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center text-base" />
                        </div>
                        <div className="space-y-1 w-20 shrink-0">
                            <Label htmlFor="sawn-quantity-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Qty</Label>
                            <Input id="sawn-quantity-float" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" className="h-11 text-center text-base" />
                        </div>
                        <div className="space-y-1 w-20 shrink-0">
                            <Label htmlFor="sawn-rate-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Rate</Label>
                            <Input id="sawn-rate-float" value={formValues.rate} onChange={e => handleFormChange('rate', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center text-base" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-1 w-[80px]">
                    <Button type="button" variant="outline" size="sm" className="h-auto py-2" onClick={clearForm}>
                        {editingId ? 'Cancel' : 'Clear'}
                    </Button>
                    <Button type="submit" size="sm" className="h-auto py-2">
                        {editingId ? 'Update' : 'Enter'}
                    </Button>
                </div>
            </div>
            {formError && <p className="text-xs text-destructive mt-1 text-center">{formError}</p>}
        </div>
      </form>
    </Card>
  );
}

function RoundLogsCalculator() {
    const initialFormState = { length: "", girth: "", quantity: "", rate: "" };
    const [formValues, setFormValues] = useState(initialFormState);
    const [entries, setEntries] = useState<RoundLogEntry[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [customerName, setCustomerName] = useState("");
    const [lastUsedRate, setLastUsedRate] = useState("");

     useLayoutEffect(() => {
        if (!editingId) {
            setFormValues(prev => ({ ...prev, rate: lastUsedRate }));
        }
    }, [lastUsedRate, editingId]);

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
        const { length, girth, quantity, rate } = parsed.data;
        const cft = ((girth * girth * length) / 2304);
        const totalAmount = cft * quantity * (rate || 0);

        if (rate !== undefined) {
            setLastUsedRate(String(rate));
        }

        if (editingId) {
            setEntries(prev => prev.map(entry =>
                entry.id === editingId
                ? { ...entry, length, girth, quantity, cft, rate, totalAmount }
                : entry
            ));
        } else {
            setEntries(prev => [...prev, {
                id: Date.now(),
                length,
                girth,
                quantity,
                cft,
                rate,
                totalAmount
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
            rate: String(entry.rate ?? ''),
        });
        setFormError(null);
        (document.getElementById('log-length') as HTMLInputElement)?.focus();
    }

    const removeEntry = (id: number) => {
        setEntries(entries.filter(entry => entry.id !== id));
    };
    
    const clearForm = () => {
        setFormValues({ ...initialFormState, rate: lastUsedRate });
        setFormError(null);
        setEditingId(null);
    }

    const { totalCft, totalQuantity, totalAmount } = useMemo(() => {
        return entries.reduce(
          (acc, entry) => {
            acc.totalCft += entry.cft * entry.quantity;
            acc.totalQuantity += entry.quantity;
            acc.totalAmount += entry.totalAmount;
            return acc;
          },
          { totalCft: 0, totalQuantity: 0, totalAmount: 0 }
        );
      }, [entries]);

    const generateRoundLogPdfDoc = (customerName: string) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let currentY = 22;
        
        doc.setFontSize(20);
        doc.text("SVLSM Timber Pro - Round Logs", pageWidth / 2, currentY, { align: 'center' });
        currentY += 6;

        if (customerName) {
            doc.setFontSize(12);
            doc.text(`Customer: ${customerName}`, pageWidth / 2, currentY, { align: 'center' });
            currentY += 6;
        }

        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 7;

        (doc as any).autoTable({
            head: [['#', 'Dimensions (L×G)', 'Qty', 'Rate', 'Total CFT', 'Total Amt']],
            body: entries.map((entry, index) => [
                index + 1,
                `${entry.length}" × ${entry.girth}'`,
                entry.quantity,
                entry.rate?.toFixed(2) ?? '-',
                (entry.cft * entry.quantity).toFixed(4),
                `Rs. ${entry.totalAmount.toFixed(2)}`,
            ]),
            startY: currentY,
            headStyles: { fillColor: [36, 69, 76] },
            theme: 'grid',
            styles: { halign: 'right' },
            columnStyles: {
                0: { halign: 'center' },
                1: { halign: 'left' },
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        doc.autoTable({
            body: [
                ['Total Nos.', `${totalQuantity}`],
                ['Total CFT', `${totalCft.toFixed(4)}`],
                ['Grand Total', `Rs. ${totalAmount.toFixed(2)}`],
            ],
            startY: finalY + 5,
            theme: 'plain',
            bodyStyles: {
                fontStyle: 'bold',
                fontSize: 12,
            },
            columnStyles: {
                0: { halign: 'right' },
                1: { halign: 'right' },
            }
        });

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                'SVLSM Timber Pro',
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }
        return doc;
    };
    
    const handleDownloadPdf = () => {
        const doc = generateRoundLogPdfDoc(customerName);
        const fileName = customerName.trim() ? `${customerName.trim()}.pdf` : `RoundLogs_${totalCft.toFixed(4)}CFT.pdf`;
        doc.save(fileName);
    };

    const handleSharePdf = async () => {
        const doc = generateRoundLogPdfDoc(customerName);
        const pdfBlob = doc.output('blob');
        const fileName = customerName.trim() ? `${customerName.trim()}.pdf` : `RoundLogs_${totalCft.toFixed(4)}CFT.pdf`;
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SVLSM Timber Pro - Round Logs',
                    text: `Round Logs CFT calculation for ${customerName.trim() || 'your project'}.`,
                    files: [pdfFile],
                });
            } catch (error) {
                console.log('Sharing failed, falling back to download', error);
                handleDownloadPdf();
            }
        } else {
            handleDownloadPdf();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Round Logs</CardTitle>
                <CardDescription>Add multiple log sizes to calculate the total CFT using the Hoppus formula.</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 space-y-4">
                <form onSubmit={handleFormSubmit} className="hidden md:block p-2 sm:p-4 border rounded-lg bg-muted/50 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="log-length">Length (ft)</Label>
                            <Input id="log-length" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="log-girth">Girth (in)</Label>
                            <Input id="log-girth" value={formValues.girth} onChange={e => handleFormChange('girth', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="log-quantity">Quantity</Label>
                            <Input id="log-quantity" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" placeholder="" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="log-rate">Rate</Label>
                            <Input id="log-rate" value={formValues.rate} onChange={e => handleFormChange('rate', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="per CFT" />
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

                <div className="overflow-x-auto border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center px-2">#</TableHead>
                                <TableHead className="px-2">Dimensions</TableHead>
                                <TableHead className="text-right px-2">Qty</TableHead>
                                <TableHead className="text-right px-2">Rate</TableHead>
                                <TableHead className="text-right px-2">Total CFT</TableHead>
                                <TableHead className="text-right px-2">Total Amt</TableHead>
                                <TableHead className="w-28 text-center px-2">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground p-4">No entries added yet.</TableCell>
                                </TableRow>
                            ) : entries.map((entry, index) => (
                              <TableRow key={entry.id}>
                                <TableCell className="p-2 text-center font-medium">{index + 1}</TableCell>
                                <TableCell className="p-2">
                                    <div className="font-medium whitespace-normal">{entry.length}" × {entry.girth}'</div>
                                    <div className="text-xs text-muted-foreground">Item CFT: {entry.cft.toFixed(4)}</div>
                                </TableCell>
                                <TableCell className="p-2 text-right">{entry.quantity}</TableCell>
                                <TableCell className="p-2 text-right">{entry.rate?.toFixed(2) ?? '-'}</TableCell>
                                <TableCell className="p-2 text-right font-medium">{(entry.cft * entry.quantity).toFixed(4)}</TableCell>
                                <TableCell className="p-2 text-right font-bold">Rs. {entry.totalAmount.toFixed(2)}</TableCell>
                                <TableCell className="p-2 text-center">
                                  <div className="flex items-center justify-center">
                                    <Button variant="ghost" size="icon" type="button" onClick={() => handleEditClick(entry)} className="text-muted-foreground hover:text-primary h-8 w-8">
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" type="button" onClick={() => removeEntry(entry.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Remove</span>
                                    </Button>
                                   </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            {entries.length > 0 && (
                <CardFooter className="flex-col items-stretch p-2 sm:p-6 border-t bg-muted/50 space-y-2">
                    <div className="flex justify-between text-base sm:text-lg">
                        <span className="text-muted-foreground">Total Nos.</span>
                        <span className="font-bold">{totalQuantity}</span>
                    </div>
                    <div className="flex justify-between text-xl sm:text-2xl">
                        <span className="text-muted-foreground">Total CFT</span>
                        <span className="font-bold font-headline">{totalCft.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-2xl sm:text-3xl">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="font-bold font-headline text-primary">Rs. {totalAmount.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={handleDownloadPdf} variant="outline">
                            <FileDown className="mr-2 h-4 w-4" /> Download PDF
                        </Button>
                        <Button onClick={handleSharePdf}>
                            <Share2 className="mr-2 h-4 w-4" /> Share PDF
                        </Button>
                    </div>
                    <div className="space-y-2 pt-4">
                        <Label htmlFor="round-customer-name">Customer Name (for PDF)</Label>
                        <Input 
                            id="round-customer-name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Optional: Enter name for PDF filename"
                            className="h-11"
                        />
                    </div>
                </CardFooter>
            )}
            <div className="h-44 md:hidden" />
             <form onSubmit={handleFormSubmit} className="fixed bottom-20 left-0 right-0 z-40 p-2 bg-background/80 backdrop-blur-sm border-t md:hidden">
                <div className="max-w-xl mx-auto p-2 rounded-lg bg-card/90 border-2 border-primary/50">
                    <div className="flex items-end gap-2">
                         <div className="flex-1 overflow-x-auto">
                            <div className="flex gap-2 pr-2">
                                <div className="space-y-1 w-20 shrink-0">
                                    <Label htmlFor="log-length-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Length (ft)</Label>
                                    <Input id="log-length-float" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center text-base" />
                                </div>
                                <div className="space-y-1 w-20 shrink-0">
                                    <Label htmlFor="log-girth-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Girth (in)</Label>
                                    <Input id="log-girth-float" value={formValues.girth} onChange={e => handleFormChange('girth', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center text-base" />
                                </div>
                                <div className="space-y-1 w-20 shrink-0">
                                    <Label htmlFor="log-quantity-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Quantity</Label>
                                    <Input id="log-quantity-float" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" className="h-11 text-center text-base" />
                                </div>
                                <div className="space-y-1 w-20 shrink-0">
                                    <Label htmlFor="log-rate-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Rate</Label>
                                    <Input id="log-rate-float" value={formValues.rate} onChange={e => handleFormChange('rate', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center text-base" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 w-[80px]">
                            <Button type="button" variant="outline" size="sm" className="h-auto py-2" onClick={clearForm}>
                                {editingId ? 'Cancel' : 'Clear'}
                            </Button>
                            <Button type="submit" size="sm" className="h-auto py-2">
                                {editingId ? 'Update' : 'Enter'}
                            </Button>
                        </div>
                    </div>
                    {formError && <p className="text-xs text-destructive mt-1 text-center">{formError}</p>}
                </div>
            </form>
        </Card>
    );
}

function BeadingPattiCalculator() {
  const { beadingPattiSizes } = useInventory();
  const isMobile = useIsMobile();
  const initialFormState = { size: "", grade: "", length: "", quantity: "", bundle: "", rate: "" };
  const [formValues, setFormValues] = useState(initialFormState);
  const [entries, setEntries] = useState<BeadingPattiEntry[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [ratesByGradeAndSize, setRatesByGradeAndSize] = useState<Record<string, string>>({});

  const sortedEntries = useMemo(() => {
    const parseSize = (sizeStr: string): number[] => {
      const parts = sizeStr.match(/(\d*\.?\d+)/g);
      if (!parts || parts.length < 2) return [0, 0];
      return parts.map(Number);
    };

    return [...entries].sort((a, b) => {
      const [widthA, thicknessA] = parseSize(a.size);
      const [widthB, thicknessB] = parseSize(b.size);

      if (widthA !== widthB) return widthA - widthB;
      if (thicknessA !== thicknessB) return thicknessA - thicknessB;
      if (a.length !== b.length) return a.length - b.length;
      return 0;
    });
  }, [entries]);

  const handleFormChange = (field: string, value: string) => {
    const newValues = { ...formValues, [field]: value };
    if (field === 'size' || field === 'grade') {
        const size = newValues.size;
        const grade = newValues.grade;
        if (size && grade) {
            const rateKey = `${size}::${grade}`;
            newValues.rate = ratesByGradeAndSize[rateKey] || '';
        }
    }
    setFormValues(newValues);
    setFormError(null);
  };
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = BeadingPattiEntrySchema.safeParse(formValues);
    
    if (!parsed.success) {
      setFormError(parsed.error.errors[0].message);
      return;
    }
    
    setFormError(null);
    const { size, grade, length, quantity, bundle, rate } = parsed.data;
    const totalLength = length * quantity * (bundle || 1);
    const totalAmount = totalLength * (rate || 0);

    if (rate !== undefined && size && grade) {
      const rateKey = `${size}::${grade}`;
      setRatesByGradeAndSize(prev => ({...prev, [rateKey]: String(rate)}));
    }
    
    if (editingId) {
        setEntries(prev => prev.map(entry => 
            entry.id === editingId 
            ? { ...entry, size, grade, length, quantity, bundle, rate, totalLength, totalAmount } 
            : entry
        ));
    } else {
        setEntries(prev => [...prev, {
            id: Date.now(),
            size,
            grade,
            length,
            quantity,
            bundle,
            rate,
            totalLength,
            totalAmount
        }]);
    }

    setFormValues(prev => ({
        ...initialFormState,
        size: prev.size,
        grade: prev.grade,
        rate: rate !== undefined ? String(rate) : '',
    }));
    setFormError(null);
    setEditingId(null);
    
    setTimeout(() => {
        const id = isMobile ? 'beading-length-float' : 'beading-length';
        const lengthInput = document.getElementById(id);
        if (lengthInput) {
            lengthInput.focus();
        }
    }, 0);
  };

  const handleEditClick = (entry: BeadingPattiEntry) => {
    setEditingId(entry.id);
    setFormValues({
        size: entry.size,
        grade: entry.grade ?? "",
        length: String(entry.length),
        quantity: String(entry.quantity),
        bundle: String(entry.bundle ?? ""),
        rate: String(entry.rate ?? ''),
    });
    setFormError(null);
    const id = isMobile ? 'beading-length-float' : 'beading-length';
    const lengthInput = document.getElementById(id);
    if (lengthInput) {
        lengthInput.focus();
    }
  }

  const removeEntry = (id: number) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };
  
  const clearForm = () => {
      setFormValues(prev => {
          const rateKey = `${prev.size}::${prev.grade}`;
          return {
            ...initialFormState,
            size: prev.size,
            grade: prev.grade,
            rate: ratesByGradeAndSize[rateKey] || '',
          };
      });
      setFormError(null);
      setEditingId(null);
  }
  
  const { totalRunningFeet, totalQuantity, totalAmount } = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.totalRunningFeet += entry.totalLength;
        acc.totalQuantity += entry.quantity * (entry.bundle || 1);
        acc.totalAmount += entry.totalAmount;
        return acc;
      },
      { totalRunningFeet: 0, totalQuantity: 0, totalAmount: 0 }
    );
  }, [entries]);

  const generateBeadingPattiPdfDoc = (customerName: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 22;

    doc.setFontSize(20);
    doc.text("SVLSM Timber Pro - Beading Patti", pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;

    if (customerName) {
        doc.setFontSize(12);
        doc.text(`Customer: ${customerName}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 6;
    }
    
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
    
    const entriesBySize = entries.reduce((acc, entry) => {
        if (!acc[entry.size]) {
            acc[entry.size] = [];
        }
        acc[entry.size].push(entry);
        return acc;
    }, {} as Record<string, BeadingPattiEntry[]>);

    const parseSize = (sizeStr: string): number[] => {
      const parts = sizeStr.match(/(\d*\.?\d+)/g);
      if (!parts || parts.length < 2) return [0, 0];
      return parts.map(Number);
    };

    const sortedSizes = Object.keys(entriesBySize).sort((a, b) => {
      const [widthA, thicknessA] = parseSize(a);
      const [widthB, thicknessB] = parseSize(b);
      if (widthA !== widthB) return widthA - widthB;
      return thicknessA - thicknessB;
    });

    sortedSizes.forEach((size) => {
        const sizeEntries = entriesBySize[size].sort((a, b) => a.length - b.length);
        const sizeTotalRFT = sizeEntries.reduce((sum, entry) => sum + entry.totalLength, 0);
        const sizeTotalAmount = sizeEntries.reduce((sum, entry) => sum + entry.totalAmount, 0);
        const sizeTotalQty = sizeEntries.reduce((sum, entry) => sum + entry.quantity * (entry.bundle || 1), 0);

        if (currentY > doc.internal.pageSize.getHeight() - 80) {
            doc.addPage();
            currentY = 22;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Size: ${size}`, 14, currentY);
        currentY += 6;

        (doc as any).autoTable({
            head: [['#', 'Grade', 'Length (ft)', 'Qty', 'Bundle', 'Rate (per ft)', 'Total RFT', 'Total Amt']],
            body: sizeEntries.map((entry, index) => [
                index + 1,
                entry.grade ?? '-',
                `${entry.length}"`,
                entry.quantity,
                entry.bundle ?? '-',
                entry.rate?.toFixed(2) ?? '-',
                entry.totalLength.toFixed(2),
                `Rs. ${entry.totalAmount.toFixed(2)}`,
            ]),
            startY: currentY,
            headStyles: { fillColor: [36, 69, 76] },
            theme: 'grid',
            styles: { halign: 'right' },
            columnStyles: {
                0: { halign: 'center' },
                1: { halign: 'left' },
                2: { halign: 'left' },
            }
        });
        
        let finalY = (doc as any).lastAutoTable.finalY;

        (doc as any).autoTable({
            body: [
                ['Total Nos.', `${sizeTotalQty}`],
                ['Total RFT', `${sizeTotalRFT.toFixed(2)}`],
                ['Total Amount', `Rs. ${sizeTotalAmount.toFixed(2)}`],
            ],
            startY: finalY + 2,
            theme: 'plain',
            bodyStyles: { fontStyle: 'bold', fontSize: 10 },
            columnStyles: { 0: { halign: 'right' }, 1: { halign: 'right' } }
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 12;
    });

    if (currentY > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        currentY = 22;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Grand Total", 14, currentY);
    currentY += 8;

    (doc as any).autoTable({
        body: [
            ['Total Nos.', `${totalQuantity}`],
            ['Total RFT', `${totalRunningFeet.toFixed(2)}`],
            ['Grand Total', `Rs. ${totalAmount.toFixed(2)}`],
        ],
        startY: currentY,
        theme: 'plain',
        bodyStyles: {
            fontStyle: 'bold',
            fontSize: 12,
        },
        columnStyles: {
            0: { halign: 'right' },
            1: { halign: 'right' },
        }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            'SVLSM Timber Pro',
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    return doc;
  };

  const handleDownloadPdf = () => {
    const doc = generateBeadingPattiPdfDoc(customerName);
    const fileName = customerName.trim() ? `${customerName.trim()}.pdf` : `BeadingPatti_${totalRunningFeet.toFixed(2)}RFT.pdf`;
    doc.save(fileName);
  };
  
  const handleSharePdf = async () => {
    const doc = generateBeadingPattiPdfDoc(customerName);
    const pdfBlob = doc.output('blob');
    const fileName = customerName.trim() ? `${customerName.trim()}.pdf` : `BeadingPatti_${totalRunningFeet.toFixed(2)}RFT.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'SVLSM Timber Pro - Beading Patti',
                text: `Beading Patti calculation for ${customerName.trim() || 'your project'}.`,
                files: [pdfFile],
            });
        } catch (error) {
            console.log('Sharing failed, falling back to download', error);
            handleDownloadPdf();
        }
    } else {
        handleDownloadPdf();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beading Patti</CardTitle>
        <CardDescription>Calculate the total running feet (RFT) and cost for beading patti.</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 space-y-4">
        <form onSubmit={handleFormSubmit} className="hidden md:block p-2 sm:p-4 border rounded-lg bg-muted/50 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="beading-size">Size</Label>
                    <Select name="size" value={formValues.size} onValueChange={value => handleFormChange('size', value)}>
                        <SelectTrigger id="beading-size" onKeyDown={handleInputKeyDown}>
                            <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                        <SelectContent>
                            {beadingPattiSizes?.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="beading-grade">Grade</Label>
                     <Select name="grade" value={formValues.grade} onValueChange={value => handleFormChange('grade', value)}>
                        <SelectTrigger id="beading-grade" onKeyDown={handleInputKeyDown}>
                            <SelectValue placeholder="Select a grade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1st Grade">1st Grade</SelectItem>
                            <SelectItem value="2nd Grade">2nd Grade</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="beading-rate">Rate (per ft)</Label>
                    <Input id="beading-rate" value={formValues.rate} onChange={e => handleFormChange('rate', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="per RFT" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="beading-length">Length (ft)</Label>
                    <Input id="beading-length" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" placeholder="" />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="beading-quantity">Quantity</Label>
                    <Input id="beading-quantity" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" placeholder="" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="beading-bundle">Bundle</Label>
                    <Input id="beading-bundle" value={formValues.bundle} onChange={e => handleFormChange('bundle', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" placeholder="" />
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

        <div className="overflow-x-auto border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center px-2">#</TableHead>
                        <TableHead className="px-2">Size</TableHead>
                        <TableHead className="px-2">Grade</TableHead>
                        <TableHead className="px-2">Length</TableHead>
                        <TableHead className="text-right px-2">Qty</TableHead>
                        <TableHead className="text-right px-2">Bundle</TableHead>
                        <TableHead className="text-right px-2">Rate</TableHead>
                        <TableHead className="text-right px-2">Total RFT</TableHead>
                        <TableHead className="text-right px-2">Total Amt</TableHead>
                        <TableHead className="w-28 text-center px-2">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center h-24 text-muted-foreground p-4">No entries added yet.</TableCell>
                        </TableRow>
                    ) : sortedEntries.map((entry, index) => (
                      <TableRow key={entry.id}>
                        <TableCell className="p-2 text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="p-2 font-medium">{entry.size}</TableCell>
                        <TableCell className="p-2 font-medium">{entry.grade ?? '-'}</TableCell>
                        <TableCell className="p-2">
                            <div className="font-medium whitespace-normal">{entry.length}"</div>
                        </TableCell>
                        <TableCell className="p-2 text-right">{entry.quantity}</TableCell>
                        <TableCell className="p-2 text-right">{entry.bundle ?? '-'}</TableCell>
                        <TableCell className="p-2 text-right">{entry.rate?.toFixed(2) ?? '-'}</TableCell>
                        <TableCell className="p-2 text-right font-medium">{entry.totalLength.toFixed(2)}</TableCell>
                        <TableCell className="p-2 text-right font-bold">Rs. {entry.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="p-2 text-center">
                          <div className="flex items-center justify-center">
                            <Button variant="ghost" size="icon" type="button" onClick={() => handleEditClick(entry)} className="text-muted-foreground hover:text-primary h-8 w-8">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" type="button" onClick={() => removeEntry(entry.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
      {entries.length > 0 && (
          <CardFooter className="flex-col items-stretch p-2 sm:p-6 border-t bg-muted/50 space-y-2">
            <div className="flex justify-between text-base sm:text-lg">
                <span className="text-muted-foreground">Total Nos.</span>
                <span className="font-bold">{totalQuantity}</span>
            </div>
            <div className="flex justify-between text-xl sm:text-2xl">
                <span className="text-muted-foreground">Total RFT</span>
                <span className="font-bold font-headline">{totalRunningFeet.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl sm:text-3xl">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold font-headline text-primary">Rs. {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button onClick={handleDownloadPdf} variant="outline">
                    <FileDown className="mr-2 h-4 w-4" /> Download PDF
                </Button>
                <Button onClick={handleSharePdf}>
                    <Share2 className="mr-2 h-4 w-4" /> Share PDF
                </Button>
            </div>
            <div className="space-y-2 pt-4">
                <Label htmlFor="beading-customer-name">Customer Name (for PDF)</Label>
                <Input 
                    id="beading-customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Optional: Enter name for PDF filename"
                    className="h-11"
                />
            </div>
          </CardFooter>
      )}
      <div className="h-44 md:hidden"></div>
      <form onSubmit={handleFormSubmit} className="fixed bottom-20 left-0 right-0 z-40 p-2 bg-background/80 backdrop-blur-sm border-t md:hidden">
        <div className="max-w-xl mx-auto p-2 rounded-lg bg-card/90 border-2 border-primary/50">
            <div className="flex items-end gap-2">
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-2 pr-2">
                        <div className="space-y-1 w-36 shrink-0">
                            <Label htmlFor="beading-size-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Size</Label>
                            <Select name="size" value={formValues.size} onValueChange={value => handleFormChange('size', value)}>
                                <SelectTrigger id="beading-size-float" className="h-11 text-base">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {beadingPattiSizes?.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1 w-24 shrink-0">
                            <Label htmlFor="beading-grade-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Grade</Label>
                            <Select name="grade" value={formValues.grade} onValueChange={value => handleFormChange('grade', value)}>
                                <SelectTrigger id="beading-grade-float" className="h-11 text-base">
                                    <SelectValue placeholder="Grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1st Grade">1st Grade</SelectItem>
                                    <SelectItem value="2nd Grade">2nd Grade</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1 w-24 shrink-0">
                            <Label htmlFor="beading-rate-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Rate</Label>
                            <Input id="beading-rate-float" value={formValues.rate} onChange={e => handleFormChange('rate', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center text-base" />
                        </div>
                        <div className="space-y-1 w-24 shrink-0">
                            <Label htmlFor="beading-length-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Length (ft)</Label>
                            <Input id="beading-length-float" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center text-base" />
                        </div>
                        <div className="space-y-1 w-24 shrink-0">
                            <Label htmlFor="beading-quantity-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Qty</Label>
                            <Input id="beading-quantity-float" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" className="h-11 text-center text-base" />
                        </div>
                        <div className="space-y-1 w-24 shrink-0">
                            <Label htmlFor="beading-bundle-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Bundle</Label>
                            <Input id="beading-bundle-float" value={formValues.bundle} onChange={e => handleFormChange('bundle', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" className="h-11 text-center text-base" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-1 w-[80px]">
                    <Button type="button" variant="outline" size="sm" className="h-auto py-2" onClick={clearForm}>
                        {editingId ? 'Cancel' : 'Clear'}
                    </Button>
                    <Button type="submit" size="sm" className="h-auto py-2">
                        {editingId ? 'Update' : 'Enter'}
                    </Button>
                </div>
            </div>
            {formError && <p className="text-xs text-destructive mt-1 text-center">{formError}</p>}
        </div>
      </form>
    </Card>
  );
}

export default function CalculatorPage() {
    return (
        <div className="space-y-8">
             <header>
                <h1 className="text-3xl sm:text-4xl font-bold font-headline">SVLSM Timber Pro</h1>
                <p className="text-md sm:text-lg text-muted-foreground">
                    Calculate CFT for sawn wood and round logs.
                </p>
            </header>
            <Tabs defaultValue="sawn-wood" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="sawn-wood">Sawn Wood</TabsTrigger>
                    <TabsTrigger value="round-logs">Round Logs</TabsTrigger>
                    <TabsTrigger value="beading-patti">Beading Patti</TabsTrigger>
                </TabsList>
                <TabsContent value="sawn-wood">
                    <SawnWoodCalculator />
                </TabsContent>
                <TabsContent value="round-logs">
                    <RoundLogsCalculator />
                </TabsContent>
                <TabsContent value="beading-patti">
                    <BeadingPattiCalculator />
                </TabsContent>
            </Tabs>
        </div>
    )
}
    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    



    



    

    

    

    
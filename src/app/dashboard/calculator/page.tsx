
"use client";

import { useState, useMemo } from "react";
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
  const [customerName, setCustomerName] = useState("");

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

  const generateSawnWoodPdfDoc = (customerName: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 22;

    doc.setFontSize(20);
    doc.text("Sawn Wood CFT Calculation", pageWidth / 2, currentY, { align: 'center' });
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
        head: [['#', 'Dimensions (L×W×T)', 'Qty', 'Total CFT']],
        body: entries.map((entry, index) => [
            index + 1,
            `${entry.length}ft × ${entry.width}in × ${entry.height}in`,
            entry.quantity,
            (entry.cft * entry.quantity).toFixed(4)
        ]),
        startY: currentY,
        headStyles: { fillColor: [36, 69, 76] },
        theme: 'grid'
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.autoTable({
        body: [
            ['Total Nos.', `${totalQuantity}`],
            ['Total CFT', `${totalCft.toFixed(4)}`],
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
            '©2026 JanakPatidar.Design Studio',
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
                title: 'Sawn Wood Calculation',
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
        <CardTitle>Sawn Wood CFT Calculator</CardTitle>
        <CardDescription>Add multiple timber sizes to calculate the total cubic feet (CFT).</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 space-y-4">
        <form onSubmit={handleFormSubmit} className="hidden md:block p-2 sm:p-4 border rounded-lg bg-muted/50 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <TableHead className="w-12 text-center px-2 sm:px-4">#</TableHead>
                        <TableHead className="px-2 sm:px-4">Dimensions</TableHead>
                        <TableHead className="text-right px-2 sm:px-4">Qty</TableHead>
                        <TableHead className="text-right px-2 sm:px-4">Total CFT</TableHead>
                        <TableHead className="w-28 text-center px-2 sm:px-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground p-4">No entries added yet.</TableCell>
                        </TableRow>
                    ) : entries.map((entry, index) => (
                      <TableRow key={entry.id}>
                        <TableCell className="p-2 sm:p-4 text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="p-2 sm:p-4">
                            <div className="font-medium whitespace-normal">{entry.length}ft × {entry.width}in × {entry.height}in</div>
                            <div className="text-xs text-muted-foreground">Item CFT: {entry.cft.toFixed(4)}</div>
                        </TableCell>
                        <TableCell className="p-2 sm:p-4 text-right">{entry.quantity}</TableCell>
                        <TableCell className="p-2 sm:p-4 text-right font-medium">{(entry.cft * entry.quantity).toFixed(4)}</TableCell>
                        <TableCell className="p-2 sm:p-4 text-center">
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
                <span className="font-bold font-headline text-primary">{totalCft.toFixed(4)}</span>
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
      <div className="h-40 md:hidden"></div>
      <form onSubmit={handleFormSubmit} className="fixed bottom-20 left-0 right-0 z-40 p-2 bg-background/80 backdrop-blur-sm border-t md:hidden">
        <div className="max-w-xl mx-auto p-2 rounded-lg bg-card/90 border-2 border-primary/50">
            <div className="flex items-end gap-2">
                <div className="grid flex-1 grid-cols-4 gap-2">
                    <div className="space-y-1">
                        <Label htmlFor="sawn-length-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Length (ft)</Label>
                        <Input id="sawn-length-float" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="sawn-width-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Width (in)</Label>
                        <Input id="sawn-width-float" value={formValues.width} onChange={e => handleFormChange('width', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="sawn-height-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Thickness (in)</Label>
                        <Input id="sawn-height-float" value={formValues.height} onChange={e => handleFormChange('height', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="sawn-quantity-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Qty</Label>
                        <Input id="sawn-quantity-float" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" className="h-11 text-center" />
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
    const initialFormState = { length: "", girth: "", quantity: "" };
    const [formValues, setFormValues] = useState(initialFormState);
    const [entries, setEntries] = useState<RoundLogEntry[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [customerName, setCustomerName] = useState("");

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

    const generateRoundLogPdfDoc = (customerName: string) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let currentY = 22;
        
        doc.setFontSize(20);
        doc.text("Round Logs CFT Calculation", pageWidth / 2, currentY, { align: 'center' });
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
            head: [['#', 'Dimensions (L×G)', 'Qty', 'Total CFT']],
            body: entries.map((entry, index) => [
                index + 1,
                `${entry.length}ft × ${entry.girth}in`,
                entry.quantity,
                (entry.cft * entry.quantity).toFixed(4)
            ]),
            startY: currentY,
            headStyles: { fillColor: [36, 69, 76] },
            theme: 'grid'
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        doc.autoTable({
            body: [
                ['Total Nos.', `${totalQuantity}`],
                ['Total CFT', `${totalCft.toFixed(4)}`],
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
                '©2026 JanakPatidar.Design Studio',
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
                    title: 'Round Logs Calculation',
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
                <CardTitle>Round Logs CFT Calculator</CardTitle>
                <CardDescription>Add multiple log sizes to calculate the total CFT using the Hoppus formula.</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 space-y-4">
                <form onSubmit={handleFormSubmit} className="hidden md:block p-2 sm:p-4 border rounded-lg bg-muted/50 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                <TableHead className="w-12 text-center px-2 sm:px-4">#</TableHead>
                                <TableHead className="px-2 sm:px-4">Dimensions</TableHead>
                                <TableHead className="text-right px-2 sm:px-4">Qty</TableHead>
                                <TableHead className="text-right px-2 sm:px-4">Total CFT</TableHead>
                                <TableHead className="w-28 text-center px-2 sm:px-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground p-4">No entries added yet.</TableCell>
                                </TableRow>
                            ) : entries.map((entry, index) => (
                              <TableRow key={entry.id}>
                                <TableCell className="p-2 sm:p-4 text-center font-medium">{index + 1}</TableCell>
                                <TableCell className="p-2 sm:p-4">
                                    <div className="font-medium whitespace-normal">{entry.length}ft × {entry.girth}in</div>
                                    <div className="text-xs text-muted-foreground">Item CFT: {entry.cft.toFixed(4)}</div>
                                </TableCell>
                                <TableCell className="p-2 sm:p-4 text-right">{entry.quantity}</TableCell>
                                <TableCell className="p-2 sm:p-4 text-right font-medium">{(entry.cft * entry.quantity).toFixed(4)}</TableCell>
                                <TableCell className="p-2 sm:p-4 text-center">
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
                        <span className="font-bold font-headline text-primary">{totalCft.toFixed(4)}</span>
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
            <div className="h-40 md:hidden" />
             <form onSubmit={handleFormSubmit} className="fixed bottom-20 left-0 right-0 z-40 p-2 bg-background/80 backdrop-blur-sm border-t md:hidden">
                <div className="max-w-xl mx-auto p-2 rounded-lg bg-card/90 border-2 border-primary/50">
                    <div className="flex items-end gap-2">
                        <div className="grid flex-1 grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="log-length-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Length (ft)</Label>
                                <Input id="log-length-float" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="log-girth-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Girth (in)</Label>
                                <Input id="log-girth-float" value={formValues.girth} onChange={e => handleFormChange('girth', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="log-quantity-float" className="text-xs px-1 text-center h-8 flex items-center justify-center">Quantity</Label>
                                <Input id="log-quantity-float" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" className="h-11 text-center" />
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
    

    

    

    



    

    

    

    

    
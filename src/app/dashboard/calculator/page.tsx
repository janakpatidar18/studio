
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { Plus, Trash2, X, Edit, Download, Share2 } from "lucide-react";
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

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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

  const generateSawnWoodPdfDoc = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("Sawn Wood CFT Calculation", pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Date: ${dateStr}`, pageWidth / 2, 22, { align: 'center' });

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
        startY: 30,
        didDrawPage: function (data) {
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Page Number
            let str = `Page ${doc.internal.getNumberOfPages()}`;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(str, data.settings.margin.left, pageHeight - 10);
            
            // Footer
            doc.setFontSize(9);
            doc.setTextColor(128);
            doc.text("©2026 JanakPatidar.Design Studio", pageWidth / 2, pageHeight - 10, { align: 'center' });
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

    return doc;
  };

  const handleDownloadPdf = async () => {
    const doc = await generateSawnWoodPdfDoc();
    const today = new Date();
    doc.save(`sawn-wood-cft_${today.toISOString().split('T')[0]}.pdf`);
  };

  const handleSharePdf = async () => {
    const doc = await generateSawnWoodPdfDoc();
    const today = new Date();
    const fileName = `sawn-wood-cft_${today.toISOString().split('T')[0]}.pdf`;
    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          title: 'Sawn Wood CFT Calculation',
          text: 'Here is the Sawn Wood CFT Calculation PDF.',
          files: [pdfFile],
        });
      } catch (error) {
        console.error('Error sharing PDF:', error);
      }
    } else {
      alert("Web Share API is not supported in this browser. Downloading the PDF instead.");
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
                    <Input id="sawn-length" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="sawn-width">Width (in)</Label>
                    <Input id="sawn-width" value={formValues.width} onChange={e => handleFormChange('width', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="sawn-height">Thickness (in)</Label>
                    <Input id="sawn-height" value={formValues.height} onChange={e => handleFormChange('height', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="sawn-quantity">Quantity</Label>
                    <Input id="sawn-quantity" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" />
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
                            <div className="font-medium whitespace-normal">{entry.length.toFixed(2)}ft × {entry.width.toFixed(2)}in × {entry.height.toFixed(2)}in</div>
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
                <span className="text-muted-foreground">Total Quantity</span>
                <span className="font-bold">{totalQuantity}</span>
            </div>
            <div className="flex justify-between text-xl sm:text-2xl">
                <span className="text-muted-foreground">Total CFT</span>
                <span className="font-bold font-headline text-primary">{totalCft.toFixed(4)}</span>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleDownloadPdf} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
                <Button onClick={handleSharePdf} className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share PDF
                </Button>
            </div>
          </CardFooter>
      )}
      <form onSubmit={handleFormSubmit} className="fixed bottom-20 left-0 right-0 z-40 p-2 bg-background/80 backdrop-blur-sm border-t md:hidden">
        <div className="max-w-xl mx-auto p-2 rounded-lg bg-card/90 border-2 border-primary/50">
            <div className="flex items-end gap-2">
                <div className="grid flex-1 grid-cols-4 gap-2">
                    <div className="space-y-1">
                        <Label htmlFor="sawn-length-float" className="text-xs px-1 text-center block">Length (ft)</Label>
                        <Input id="sawn-length-float" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="sawn-width-float" className="text-xs px-1 text-center block">Width (in)</Label>
                        <Input id="sawn-width-float" value={formValues.width} onChange={e => handleFormChange('width', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="sawn-height-float" className="text-xs px-1 text-center block">Thickness (in)</Label>
                        <Input id="sawn-height-float" value={formValues.height} onChange={e => handleFormChange('height', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="sawn-quantity-float" className="text-xs px-1 text-center block">Qty</Label>
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

      const generateRoundLogsPdfDoc = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text("Round Logs CFT Calculation", pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(11);
        doc.text(`Date: ${dateStr}`, pageWidth / 2, 22, { align: 'center' });
    
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
            startY: 30,
            didDrawPage: function (data) {
                const pageHeight = doc.internal.pageSize.getHeight();
                const pageWidth = doc.internal.pageSize.getWidth();
                
                // Page Number
                let str = `Page ${doc.internal.getNumberOfPages()}`;
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(str, data.settings.margin.left, pageHeight - 10);
                
                // Footer
                doc.setFontSize(9);
                doc.setTextColor(128);
                doc.text("©2026 JanakPatidar.Design Studio", pageWidth / 2, pageHeight - 10, { align: 'center' });
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
        
        return doc;
    };

    const handleDownloadPdf = async () => {
        const doc = await generateRoundLogsPdfDoc();
        const today = new Date();
        doc.save(`round-logs-cft_${today.toISOString().split('T')[0]}.pdf`);
    };

    const handleSharePdf = async () => {
        const doc = await generateRoundLogsPdfDoc();
        const today = new Date();
        const fileName = `round-logs-cft_${today.toISOString().split('T')[0]}.pdf`;
        const pdfBlob = doc.output('blob');
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

        if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
            try {
                await navigator.share({
                    title: 'Round Logs CFT Calculation',
                    text: 'Here is the Round Logs CFT Calculation PDF.',
                    files: [pdfFile],
                });
            } catch (error) {
                console.error('Error sharing PDF:', error);
            }
        } else {
            alert("Web Share API is not supported in this browser. Downloading the PDF instead.");
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
                            <Input id="log-length" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="log-girth">Girth (in)</Label>
                            <Input id="log-girth" value={formValues.girth} onChange={e => handleFormChange('girth', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="log-quantity">Quantity</Label>
                            <Input id="log-quantity" value={formValues.quantity} onChange={e => handleFormChange('quantity', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="numeric" min="1" />
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
                                    <div className="font-medium whitespace-normal">{entry.length.toFixed(2)}ft × {entry.girth.toFixed(2)}in</div>
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
                        <span className="text-muted-foreground">Total Quantity</span>
                        <span className="font-bold">{totalQuantity}</span>
                    </div>
                    <div className="flex justify-between text-xl sm:text-2xl">
                        <span className="text-muted-foreground">Total CFT</span>
                        <span className="font-bold font-headline text-primary">{totalCft.toFixed(4)}</span>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Button onClick={handleDownloadPdf} variant="outline" className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                        <Button onClick={handleSharePdf} className="w-full">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share PDF
                        </Button>
                    </div>
                </CardFooter>
            )}
             <form onSubmit={handleFormSubmit} className="fixed bottom-20 left-0 right-0 z-40 p-2 bg-background/80 backdrop-blur-sm border-t md:hidden">
                <div className="max-w-xl mx-auto p-2 rounded-lg bg-card/90 border-2 border-primary/50">
                    <div className="flex items-end gap-2">
                        <div className="grid flex-1 grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="log-length-float" className="text-xs px-1 text-center block">Length (ft)</Label>
                                <Input id="log-length-float" value={formValues.length} onChange={e => handleFormChange('length', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="log-girth-float" className="text-xs px-1 text-center block">Girth (in)</Label>
                                <Input id="log-girth-float" value={formValues.girth} onChange={e => handleFormChange('girth', e.target.value)} onKeyDown={handleInputKeyDown} type="number" inputMode="decimal" step="any" className="h-11 text-center" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="log-quantity-float" className="text-xs px-1 text-center block">Quantity</Label>
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
    

    

    

    
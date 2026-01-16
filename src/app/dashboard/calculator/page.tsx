
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { PlusCircle, Trash2 } from "lucide-react";

const SawnWoodSchema = z.object({
  length: z.coerce.number().min(0.01, "Length must be positive"),
  width: z.coerce.number().min(0.01, "Width must be positive"),
  height: z.coerce.number().min(0.01, "Height must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

const RoundLogSchema = z.object({
  length: z.coerce.number().min(0.01, "Length must be positive"),
  girth: z.coerce.number().min(0.01, "Girth must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});


function SawnWoodCalculator() {
  const [entries, setEntries] = useState([
      { id: Date.now(), length: "", width: "", height: "", quantity: "1" }
  ]);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEntryChange = (id: number, field: string, value: string) => {
    const newEntries = entries.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    setEntries(newEntries);
    setResult(null);
  };

  const addEntry = () => {
    setEntries([...entries, { id: Date.now(), length: "", width: "", height: "", quantity: "1" }]);
  };

  const removeEntry = (id: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let totalCft = 0;
    setError(null);
    let hasValidRow = false;

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (!entry.length && !entry.width && !entry.height) {
            continue;
        }

        const parsed = SawnWoodSchema.safeParse(entry);
        if (!parsed.success) {
            const firstError = parsed.error.errors[0];
            setError(`Row ${i + 1}: ${firstError.message}`);
            setResult(null);
            return;
        }
        hasValidRow = true;
        const { length, width, height, quantity } = parsed.data;
        totalCft += ((length * width * height) / 144) * quantity;
    }

    if (hasValidRow) {
        setResult(totalCft);
    } else {
        setResult(null);
        setError("Please fill in at least one row.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sawn Wood CFT Calculator</CardTitle>
        <CardDescription>Add multiple timber sizes to calculate the total cubic feet (CFT).</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="max-h-[45vh] overflow-y-auto space-y-4 pr-4">
            {entries.map((entry, index) => (
              <div key={entry.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end p-4 border rounded-lg bg-card/50 relative pt-8">
                 <div className="absolute top-2 left-2 text-xs font-bold text-muted-foreground">{`#${index + 1}`}</div>
                <div className="space-y-2">
                  <Label htmlFor={`sawn-length-${entry.id}`}>Length (ft)</Label>
                  <Input id={`sawn-length-${entry.id}`} value={entry.length} onChange={e => handleEntryChange(entry.id, 'length', e.target.value)} type="number" step="any" placeholder="e.g., 10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`sawn-width-${entry.id}`}>Width (in)</Label>
                  <Input id={`sawn-width-${entry.id}`} value={entry.width} onChange={e => handleEntryChange(entry.id, 'width', e.target.value)} type="number" step="any" placeholder="e.g., 6" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`sawn-height-${entry.id}`}>Thickness (in)</Label>
                  <Input id={`sawn-height-${entry.id}`} value={entry.height} onChange={e => handleEntryChange(entry.id, 'height', e.target.value)} type="number" step="any" placeholder="e.g., 2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`sawn-quantity-${entry.id}`}>Quantity</Label>
                  <Input id={`sawn-quantity-${entry.id}`} value={entry.quantity} onChange={e => handleEntryChange(entry.id, 'quantity', e.target.value)} type="number" min="1" placeholder="e.g., 1" />
                </div>
                <Button variant="ghost" size="icon" type="button" onClick={() => removeEntry(entry.id)} disabled={entries.length <= 1} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t space-y-4">
            <Button type="button" variant="outline" onClick={addEntry} className="w-full">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add another size
            </Button>
            <Button type="submit" className="w-full">Calculate Total CFT</Button>
            
            {error && (
                <div className="text-center text-destructive font-medium">
                  <p>{error}</p>
                </div>
            )}
            {result !== null && (
              <div className="mt-2 text-center">
                <p className="text-lg text-muted-foreground">Total Cubic Feet (CFT)</p>
                <p className="text-4xl font-bold font-headline">{result.toFixed(4)}</p>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function RoundLogsCalculator() {
    const [entries, setEntries] = useState([
        { id: Date.now(), length: "", girth: "", quantity: "1" }
    ]);
    const [result, setResult] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleEntryChange = (id: number, field: string, value: string) => {
        const newEntries = entries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        );
        setEntries(newEntries);
        setResult(null);
    };

    const addEntry = () => {
        setEntries([...entries, { id: Date.now(), length: "", girth: "", quantity: "1" }]);
    };

    const removeEntry = (id: number) => {
        if (entries.length > 1) {
            setEntries(entries.filter(entry => entry.id !== id));
        }
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let totalCft = 0;
        setError(null);
        let hasValidRow = false;

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (!entry.length && !entry.girth) {
                continue;
            }
            
            const parsed = RoundLogSchema.safeParse(entry);
            if (!parsed.success) {
                setError(`Row ${i + 1}: ${parsed.error.errors[0].message}`);
                setResult(null);
                return;
            }
            
            hasValidRow = true;
            const { length, girth, quantity } = parsed.data;
            totalCft += ((girth * girth * length) / 2304) * quantity;
        }

        if (hasValidRow) {
            setResult(totalCft);
        } else {
             setResult(null);
             setError("Please fill in at least one row.");
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Round Logs CFT Calculator</CardTitle>
                <CardDescription>Add multiple log sizes to calculate the total cubic feet (CFT) using the Hoppus formula.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="max-h-[45vh] overflow-y-auto space-y-4 pr-4">
                        {entries.map((entry, index) => (
                            <div key={entry.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end p-4 border rounded-lg bg-card/50 relative pt-8">
                                <div className="absolute top-2 left-2 text-xs font-bold text-muted-foreground">{`#${index + 1}`}</div>
                                <div className="space-y-2">
                                    <Label htmlFor={`log-length-${entry.id}`}>Length (ft)</Label>
                                    <Input id={`log-length-${entry.id}`} value={entry.length} onChange={e => handleEntryChange(entry.id, 'length', e.target.value)} type="number" step="any" placeholder="e.g., 12" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`log-girth-${entry.id}`}>Girth (in)</Label>
                                    <Input id={`log-girth-${entry.id}`} value={entry.girth} onChange={e => handleEntryChange(entry.id, 'girth', e.target.value)} type="number" step="any" placeholder="e.g., 50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`log-quantity-${entry.id}`}>Quantity</Label>
                                    <Input id={`log-quantity-${entry.id}`} value={entry.quantity} onChange={e => handleEntryChange(entry.id, 'quantity', e.target.value)} type="number" min="1" placeholder="e.g., 1" />
                                </div>
                                <Button variant="ghost" size="icon" type="button" onClick={() => removeEntry(entry.id)} disabled={entries.length <= 1} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-5 w-5" />
                                    <span className="sr-only">Remove</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="pt-6 border-t space-y-4">
                        <Button type="button" variant="outline" onClick={addEntry} className="w-full">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Add another size
                        </Button>
                        <Button type="submit" className="w-full">Calculate Total CFT</Button>
                        
                        {error && (
                            <div className="text-center text-destructive font-medium">
                              <p>{error}</p>
                            </div>
                        )}
                        {result !== null && (
                          <div className="mt-2 text-center">
                            <p className="text-lg text-muted-foreground">Total Cubic Feet (CFT)</p>
                            <p className="text-4xl font-bold font-headline">{result.toFixed(4)}</p>
                          </div>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}


export default function CalculatorPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold font-headline">Timber Calculator</h1>
        <p className="text-md sm:text-lg text-muted-foreground">
          Calculate CFT for sawn wood and round logs.
        </p>
      </header>

      <Tabs defaultValue="sawn-wood" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sawn-wood">Sawn Wood</TabsTrigger>
          <TabsTrigger value="round-logs">Round Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="sawn-wood" className="mt-6">
          <SawnWoodCalculator />
        </TabsContent>
        <TabsContent value="round-logs" className="mt-6">
          <RoundLogsCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
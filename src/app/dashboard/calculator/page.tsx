"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

const SawnWoodSchema = z.object({
  length: z.coerce.number().min(0, "Length must be positive"),
  width: z.coerce.number().min(0, "Width must be positive"),
  height: z.coerce.number().min(0, "Height must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

const RoundLogSchema = z.object({
  length: z.coerce.number().min(0, "Length must be positive"),
  girth: z.coerce.number().min(0, "Girth must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});


function SawnWoodCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      length: formData.get("length"),
      width: formData.get("width"),
      height: formData.get("height"),
      quantity: formData.get("quantity") || 1,
    };
    
    const parsed = SawnWoodSchema.safeParse(data);

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      setResult(null);
      return;
    }
    
    setError(null);
    const { length, width, height, quantity } = parsed.data;
    const cft = (length * width * height) / 144;
    setResult(cft * quantity);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sawn Wood CFT Calculator</CardTitle>
        <CardDescription>Calculate the cubic feet (CFT) for sawn timber.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sawn-length">Length (ft)</Label>
              <Input id="sawn-length" name="length" type="number" step="any" placeholder="e.g., 10" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sawn-width">Width (in)</Label>
              <Input id="sawn-width" name="width" type="number" step="any" placeholder="e.g., 6" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sawn-height">Thickness (in)</Label>
              <Input id="sawn-height" name="height" type="number" step="any" placeholder="e.g., 2" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sawn-quantity">Quantity</Label>
              <Input id="sawn-quantity" name="quantity" type="number" defaultValue="1" placeholder="e.g., 1" min="1" required />
            </div>
          </div>
          <Button type="submit" className="w-full">Calculate</Button>
        </form>
        {error && (
            <div className="mt-4 text-center text-red-500 font-medium">
              <p>Error: {error}</p>
            </div>
        )}
        {result !== null && (
          <div className="mt-6 text-center">
            <p className="text-lg text-muted-foreground">Total Cubic Feet (CFT)</p>
            <p className="text-4xl font-bold font-headline">{result.toFixed(4)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoundLogsCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      length: formData.get("length"),
      girth: formData.get("girth"),
      quantity: formData.get("quantity") || 1,
    };
    
    const parsed = RoundLogSchema.safeParse(data);
    
    if(!parsed.success) {
        setError(parsed.error.errors[0].message);
        setResult(null);
        return;
    }

    setError(null);
    const { length, girth, quantity } = parsed.data;
    // Using the Hoppus formula: (Girth (in) / 4)^2 * Length (ft) / 144
    // Simplified: (Girth * Girth * Length) / 2304
    const cft = (girth * girth * length) / 2304;
    setResult(cft * quantity);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Round Logs CFT Calculator</CardTitle>
        <CardDescription>Calculate the cubic feet (CFT) for round logs using the Hoppus formula.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="log-length">Length (ft)</Label>
              <Input id="log-length" name="length" type="number" step="any" placeholder="e.g., 12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-girth">Girth (in)</Label>
              <Input id="log-girth" name="girth" type="number" step="any" placeholder="e.g., 50" required />
            </div>
             <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="log-quantity">Quantity</Label>
              <Input id="log-quantity" name="quantity" type="number" defaultValue="1" placeholder="e.g., 1" min="1" required />
            </div>
          </div>
          <Button type="submit" className="w-full">Calculate</Button>
        </form>
         {error && (
            <div className="mt-4 text-center text-red-500 font-medium">
              <p>Error: {error}</p>
            </div>
        )}
        {result !== null && (
          <div className="mt-6 text-center">
            <p className="text-lg text-muted-foreground">Total Cubic Feet (CFT)</p>
            <p className="text-4xl font-bold font-headline">{result.toFixed(4)}</p>
          </div>
        )}
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

      <Tabs defaultValue="sawn-wood" className="w-full max-w-2xl mx-auto">
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

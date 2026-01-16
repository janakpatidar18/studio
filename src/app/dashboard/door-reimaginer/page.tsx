
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2 } from "lucide-react";

export default function DoorReimaginerPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold font-headline">Door Reimaginer</h1>
        <p className="text-md sm:text-lg text-muted-foreground">
          Reimagine your door designs with the power of AI.
        </p>
      </header>

      <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                  <Wand2 className="text-primary w-7 h-7" />
                  Generate a New Design
              </CardTitle>
              <CardDescription>
                  Upload an image of a door and provide a text prompt to transform it.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                          <Label htmlFor="door-image">Door Image</Label>
                          <Input id="door-image" name="door-image" type="file" accept="image/*" required className="h-auto p-0 file:h-12 file:px-4 file:border-0"/>
                      </div>
                      <div className="space-y-3">
                          <Label htmlFor="prompt">Transformation Prompt</Label>
                          <Input id="prompt" name="prompt" placeholder="e.g., make it a rustic, antique door" required />
                      </div>
                  </div>
                   <Button type="submit" className="w-full">Reimagine</Button>
              </form>
          </CardContent>
      </Card>
    </div>
  );
}

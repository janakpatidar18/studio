
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, X, Image as ImageIcon, CheckCircle2, RotateCw } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { reimagineDoor, ReimagineDoorOutput } from "@/ai/flows/reimagine-door-flow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper to convert file to data URI
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});


export default function DoorReimaginerPage() {
  const { toast } = useToast();
  const [doorImage, setDoorImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [doorPreview, setDoorPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReimagineDoorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'door' | 'background') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if (type === 'door') {
                  setDoorImage(file);
                  setDoorPreview(event.target?.result as string);
              } else {
                  setBackgroundImage(file);
                  setBackgroundPreview(event.target?.result as string);
              }
          };
          reader.readAsDataURL(file);
      }
  };
  
  const resetInput = (type: 'door' | 'background') => {
    if (type === 'door') {
      setDoorImage(null);
      setDoorPreview(null);
      const input = document.getElementById('door-input') as HTMLInputElement;
      if(input) input.value = '';
    } else {
      setBackgroundImage(null);
      setBackgroundPreview(null);
      const input = document.getElementById('background-input') as HTMLInputElement;
      if(input) input.value = '';
    }
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!doorImage || !backgroundImage) {
        toast({
            title: "Inputs Required",
            description: "Please provide both a door and a background image.",
            variant: "destructive",
        });
        return;
    }
    
    setLoading(true);
    setResult(null);

    try {
        const doorImageB64 = await toBase64(doorImage);
        const backgroundImageB64 = await toBase64(backgroundImage);

        const response = await reimagineDoor({
            doorImage: doorImageB64,
            backgroundImage: backgroundImageB64,
        });

        setResult(response);

    } catch (err: any) {
        console.error(err);
        setError("Something went wrong while generating the image. Please try again.");
        toast({
            title: "Generation Failed",
            description: err.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  const handleStartOver = () => {
    setResult(null);
    setError(null);
    setLoading(false);
    resetInput('door');
    resetInput('background');
  };
  
  if (loading || result || error) {
    return (
        <div className="space-y-8 flex flex-col items-center">
            {loading && (
                <Card className="w-full max-w-md text-center shadow-lg">
                    <CardHeader>
                        <CardTitle>Reimagining Your Door...</CardTitle>
                        <CardDescription>The AI is working its magic. This can take up to a minute.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center items-center p-8">
                            <Wand2 className="h-16 w-16 text-primary animate-pulse" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="w-full max-w-md shadow-lg">
                     <CardHeader>
                        <CardTitle>Generation Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertTitle>An Error Occurred</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleStartOver} className="w-full">
                            <RotateCw className="mr-2 h-4 w-4" /> Try Again
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {result && (
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                         <div className="flex justify-center items-center gap-2 text-green-500">
                            <CheckCircle2 className="h-8 w-8" />
                            <CardTitle>Your New Door is Ready!</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-md border">
                            <Image
                                src={result.generatedImage}
                                alt="Generated door design"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                         <a
                            href={result.generatedImage}
                            download="reimagined-door.png"
                            className="w-full"
                         >
                            <Button className="w-full">Download Image</Button>
                         </a>
                        <Button onClick={handleStartOver} variant="outline" className="w-full">
                            <RotateCw className="mr-2 h-4 w-4" /> Start Over
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
  }

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
                  Upload an image of a door and an image for the background to transform it.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                      
                      <div className="space-y-3">
                          <Label htmlFor="door-input">1. Upload Door Image</Label>
                          {doorPreview ? (
                              <div className="relative mt-2 aspect-square w-full max-w-sm overflow-hidden rounded-md border">
                                  <Image src={doorPreview} alt="Door preview" fill className="object-contain" />
                                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 bg-background/50 hover:bg-background/80" onClick={() => resetInput('door')}>
                                      <X className="w-4 h-4" />
                                  </Button>
                              </div>
                          ) : (
                              <div className="flex items-center justify-center w-full">
                                  <label htmlFor="door-input" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                          <ImageIcon className="w-8 h-8 mb-4 text-muted-foreground" />
                                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                      </div>
                                      <Input id="door-input" type="file" accept="image/*" required className="hidden" onChange={(e) => handleImageChange(e, 'door')} />
                                  </label>
                              </div> 
                          )}
                      </div>

                      <div className="space-y-3">
                          <Label htmlFor="background-input">2. Upload Background Image</Label>
                          {backgroundPreview ? (
                              <div className="relative mt-2 aspect-square w-full max-w-sm overflow-hidden rounded-md border">
                                  <Image src={backgroundPreview} alt="Background preview" fill className="object-contain" />
                                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 bg-background/50 hover:bg-background/80" onClick={() => resetInput('background')}>
                                      <X className="w-4 h-4" />
                                  </Button>
                              </div>
                          ) : (
                             <div className="flex items-center justify-center w-full">
                                  <label htmlFor="background-input" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                          <ImageIcon className="w-8 h-8 mb-4 text-muted-foreground" />
                                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                      </div>
                                      <Input id="background-input" type="file" accept="image/*" required className="hidden" onChange={(e) => handleImageChange(e, 'background')} />
                                  </label>
                              </div> 
                          )}
                      </div>
                  </div>
                   <Button type="submit" className="w-full" disabled={!doorImage || !backgroundImage}>
                      Reimagine
                   </Button>
              </form>
          </CardContent>
      </Card>
    </div>
  );
}

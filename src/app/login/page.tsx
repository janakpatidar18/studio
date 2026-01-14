"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Warehouse } from "lucide-react";

const CORRECT_PIN = "1234";

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const woodTextureBg = PlaceHolderImages.find(p => p.id === 'wood-texture-bg');
  
  useEffect(() => {
    if (getCookie("svlsm_auth") === "true") {
      router.replace("/dashboard");
    } else {
      setIsVerifying(false);
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (pin === CORRECT_PIN) {
        document.cookie = "svlsm_auth=true; path=/; max-age=86400"; // Expires in 24 hours
        router.replace("/dashboard");
      } else {
        toast({
          title: "Authentication Failed",
          description: "The PIN you entered is incorrect.",
          variant: "destructive",
        });
        setIsLoading(false);
        setPin("");
      }
    }, 500);
  };
  
  if (isVerifying) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <svg
                    className="h-12 w-12 animate-spin text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p className="text-muted-foreground">Verifying session...</p>
            </div>
        </div>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {woodTextureBg && (
          <Image
            src={woodTextureBg.imageUrl}
            alt={woodTextureBg.description}
            fill
            className="object-cover -z-10"
            data-ai-hint={woodTextureBg.imageHint}
          />
      )}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm -z-10" />
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center p-8 flex flex-col items-center">
            <Warehouse className="w-16 h-16 text-primary" />
            <CardTitle className="text-5xl font-headline mt-4">SVLSM</CardTitle>
            <CardDescription className="text-xl pt-2">Stock Management Login</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 p-8 pt-0">
            <div className="space-y-3">
              <Label htmlFor="pin" className="text-lg">PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="* * * *"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                required
                className="text-center text-4xl tracking-[1em] h-20 text-3xl"
              />
            </div>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button type="submit" className="w-full text-2xl" size="lg" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}

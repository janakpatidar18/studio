"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Logo } from "@/components/Logo";

const CORRECT_PIN = "1234";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const woodTextureBg = PlaceHolderImages.find(p => p.id === 'wood-texture-bg');
  
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
      }
    }, 1000);
  };

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
            <Logo className="w-24 h-24 text-primary mb-4" />
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
                className="text-center text-4xl tracking-[1em]"
              />
            </div>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button type="submit" className="w-full text-xl" size="lg" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}

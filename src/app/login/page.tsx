"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading, login } = useAuth();
  const woodTextureBg = PlaceHolderImages.find(p => p.id === 'wood-texture-bg');

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login();
      toast({
        title: "Login Successful",
        description: "Welcome to your dashboard!",
      });
      router.replace("/dashboard");
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  if (loading || user) {
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
                <p className="text-muted-foreground">Loading session...</p>
            </div>
        </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full">
      {woodTextureBg && (
        <Image
          src={woodTextureBg.imageUrl}
          alt={woodTextureBg.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={woodTextureBg.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-background/80" />
      
      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col items-start justify-center p-12 text-background">
          <div className="flex items-center gap-4">
             <Image src="/logo.png" alt="SVLSM Logo" width={240} height={65} />
          </div>
        </div>

        <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-lg">
                <CardHeader className="text-center p-8">
                    <div className="flex items-center justify-center gap-2 lg:hidden mb-4">
                         <Image src="/logo.png" alt="SVLSM Logo" width={160} height={44} />
                    </div>
                    <CardTitle className="text-3xl font-bold">Get Started</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">Sign in anonymously to continue</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                <CardContent className="space-y-8 px-8">
                    <p className="text-sm text-center text-muted-foreground">
                        This application uses anonymous authentication. Your session is temporary and not linked to any personal information.
                    </p>
                </CardContent>
                <CardFooter className="p-8 pt-4">
                    <Button type="submit" className="w-full text-xl py-7" size="lg" disabled={isLoading}>
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Signing In...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <LogIn className="h-6 w-6"/>
                            <span>Sign In Anonymously</span>
                        </div>
                    )}
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>
      </div>
    </div>
  );
}

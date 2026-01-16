"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { ImageIcon, LogOut, Calculator } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { InventoryProvider } from "@/context/InventoryContext";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const woodTextureBg = PlaceHolderImages.find(p => p.id === 'wood-texture-bg');
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);
  
  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Gallery", icon: ImageIcon },
    { href: "/dashboard/calculator", label: "Calculator", icon: Calculator },
  ];

  const mobileNavItems = navItems;
  
  if (loading || !user) {
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
    <InventoryProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-center p-4">
              <Image src="/logo.png" alt="SVLSM Logo" width={128} height={35} />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label }}
                      className="text-lg h-14"
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
              <SidebarMenu>
                  <SidebarMenuItem>
                      <SidebarMenuButton onClick={handleLogout} tooltip={{children: 'Logout'}} className="text-lg h-14">
                          <LogOut className="w-6 h-6" />
                          <span>Logout</span>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="relative">
          {woodTextureBg && (
            <Image
              src={woodTextureBg.imageUrl}
              alt={woodTextureBg.description}
              fill
              className="object-cover -z-20"
              data-ai-hint={woodTextureBg.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-background/90 -z-10" />

          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
            <SidebarTrigger className="h-auto w-auto p-0">
              <Image src="/logo.png" alt="SVLSM Logo" width={90} height={24} />
              <span className="sr-only">Toggle Menu</span>
            </SidebarTrigger>
            <div className="flex-1">
              
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 md:pb-8 pb-24">
            {children}
          </main>
          
          <nav className="fixed bottom-0 left-0 right-0 z-50 p-2 border-t md:hidden bg-background/95 backdrop-blur-sm">
            <div className="grid h-16 grid-cols-2 gap-2">
              {mobileNavItems.map((item) => (
                <Link href={item.href} key={item.href} passHref>
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center h-full gap-1 p-1 text-sm rounded-lg",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </nav>
        </SidebarInset>
      </SidebarProvider>
    </InventoryProvider>
  );
}

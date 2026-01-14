"use client";
import React, { useEffect, useState } from "react";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, Package, Warehouse, ImageIcon, LogOut } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { InventoryProvider } from "@/context/InventoryContext";
import { cn } from "@/lib/utils";

function getCookie(name: string) {
    if (typeof window === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const woodTextureBg = PlaceHolderImages.find(p => p.id === 'wood-texture-bg');
  
  useEffect(() => {
    const authStatus = getCookie("svlsm_auth") === "true";
    setIsAuthenticated(authStatus);
    if (!authStatus) {
      router.replace("/login");
    }
  }, [router]);
  
  const handleLogout = () => {
    document.cookie = "svlsm_auth=; path=/; max-age=0";
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Inventory", icon: Home },
    { href: "/dashboard/stock", label: "Stock", icon: Package },
    { href: "/dashboard/gallery", label: "Gallery", icon: ImageIcon },
  ];
  
  if (isAuthenticated === null) {
    return <div className="flex h-screen w-full items-center justify-center bg-background"><p>Loading...</p></div>;
  }

  return (
    <InventoryProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-center gap-2">
              <Warehouse />
              <h1 className="text-xl font-semibold font-headline">SVLSM</h1>
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
                    >
                      <item.icon />
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
                      <SidebarMenuButton onClick={handleLogout} tooltip={{children: 'Logout'}}>
                          <LogOut />
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

          <header className="sticky top-0 z-10 flex items-center p-4 border-b bg-background/50 backdrop-blur-sm md:hidden">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 md:pb-8 pb-24">
            {children}
          </main>
          
          <nav className="fixed bottom-0 left-0 right-0 z-50 p-2 border-t md:hidden bg-background/95 backdrop-blur-sm">
            <div className="grid h-16 grid-cols-3 gap-2">
              {navItems.map((item) => (
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

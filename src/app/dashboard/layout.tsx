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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, Package, Warehouse, ImageIcon, LogOut } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { InventoryProvider } from "@/context/InventoryContext";

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
  const woodTextureBg = PlaceHolderImages.find(p => p.id === 'wood-texture-bg');

  useEffect(() => {
    const isAuthenticated = getCookie("svlsm_auth") === "true";
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [router]);
  
  const handleLogout = () => {
    document.cookie = "svlsm_auth=; path=/; max-age=0";
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Inventory", icon: Home },
    { href: "/dashboard/stock", label: "Stock Management", icon: Package },
    { href: "/dashboard/gallery", label: "Door Gallery", icon: ImageIcon },
  ];
  
  if (getCookie("svlsm_auth") !== "true") {
    return <div className="flex h-screen w-full items-center justify-center bg-background"><p>Loading...</p></div>;
  }

  return (
    <InventoryProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Warehouse className="w-8 h-8 text-primary" />
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
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </InventoryProvider>
  );
}

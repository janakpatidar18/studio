
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ImageIcon, Calculator, Shield } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { InventoryProvider } from "@/context/InventoryContext";
import { cn } from "@/lib/utils";

function SidebarItems() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const navItems = [
    { href: "/dashboard/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/dashboard/calculator", label: "Calculator", icon: Calculator },
    { href: "/dashboard/admin", label: "Admin", icon: Shield },
  ];

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref>
            <SidebarMenuButton
              onClick={handleLinkClick}
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
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const woodTextureBg = PlaceHolderImages.find(p => p.id === 'wood-texture-bg');
  
  const navItems = [
    { href: "/dashboard/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/dashboard/calculator", label: "Calculator", icon: Calculator },
    { href: "/dashboard/admin", label: "Admin", icon: Shield },
  ];

  const mobileNavItems = navItems.filter(item => item.href !== '/dashboard/admin');
  
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
            <SidebarItems />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="relative overflow-x-hidden">
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

          <main className="flex-1 p-2 sm:p-6 lg:p-8 md:pb-8 pb-44">
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

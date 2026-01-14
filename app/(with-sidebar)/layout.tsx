"use client";

import type React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { useAccount } from "wagmi";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { checkProfileComplete } from "@/lib/utils/check-profile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkProfile() {
      if (!isConnected || !address) {
        router.push("/");
        return;
      }

      // Don't redirect if already on complete-profile page
      if (pathname === "/complete-profile") {
        return;
      }

      try {
        const isComplete = await checkProfileComplete(address);
        if (!isComplete) {
          router.push("/complete-profile");
          return;
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        // If error, still allow access but user might see errors
      }
    }

    if (mounted && isConnected && address) {
      checkProfile();
    }
  }, [mounted, isConnected, address, router, pathname]);

  // Always render the same structure to avoid hydration mismatch
  // Only show content after mounted and connected
  if (!mounted || !isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

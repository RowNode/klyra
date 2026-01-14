"use client";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ArrowRightLeft,
  ChartBar,
  ChartColumnDecreasing,
  ChartNoAxesColumn,
  ChartPie,
  ChevronsUpDown,
  HelpCircle,
  History,
  Home,
  LayoutList,
  List,
  Moon,
  Sparkle,
  Sun,
  Tag,
  User,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Quests",
      url: "/quests",
      icon: LayoutList,
    },
    {
      title: "Leaderboard",
      url: "/leaderboard",
      icon: ChartNoAxesColumn,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton size="lg" className="cursor-pointer">
                <div className="bg-transparent flex aspect-square size-8 items-center justify-center">
                  <Image
                    src="/logo/klyra-logo.svg"
                    alt="Klyra"
                    width={32}
                    height={32}
                  />
                </div>
                <span className="truncate font-medium">Klyra</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter id="account-menu">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { RedirectToSignIn, SignOutButton } from "@clerk/nextjs";
import { Unauthenticated, Authenticated, useQuery } from "convex/react";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { User2Icon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardSidebar } from "./_components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {" "}
      <Authenticated>
        {" "}
        <SidebarProvider>
          <DashboardSidebar />
          {children}
        </SidebarProvider>{" "}
      </Authenticated>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
    </>
  );
}

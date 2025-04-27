"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useQuery } from "convex/react";
import { User2Icon } from "lucide-react";
//import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import { NewDirectMessage } from "./new-direct-message";
//import { userAgent } from "next/server";
import { usePathname } from "next/navigation";

export function DMSidebar() {
  const pathname = usePathname();
  const directMessages = useQuery(api.functions.dm.list);
  const user = useQuery(api.functions.user.get);
  if (!user) return null;
  return (
    <Sidebar className="left-12">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/friends">
                    <User2Icon />
                    Friends
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
            <NewDirectMessage />
            <SidebarGroupContent>
              {directMessages?.map((directMessage) => (
                <SidebarMenuItem key={directMessage._id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/dm/${directMessage._id}`}
                  >
                    <Link href={`/dms/${directMessage._id}`}>
                      <div className="flex items-center">
                        <Avatar className="size-4 mr-2">
                          <AvatarImage src={directMessage.user.image} />
                          <AvatarFallback>
                            {" "}
                            {directMessage.user.username}
                          </AvatarFallback>
                        </Avatar>
                        <p>{directMessage.user.username}</p>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <NewDirectMessage />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="flex items-center">
                      <Avatar className="size-6">
                        <AvatarImage src={user.image} />
                        <AvatarFallback> {user.username[0]}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{user.username}</p>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <SignOutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";

import { Id } from "../../../../../convex/_generated/dataModel";
import CreateChannel from "./create-channel"; // Adjust the path if `create-channel` is in a different location
import { TrashIcon, Users, Settings } from "lucide-react";
import { toast } from "sonner";
import { Voice } from "../voice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function ServerSidebar({ id }: { id: Id<"servers"> }) {
  const pathname = usePathname();
  const server = useQuery(api.functions.server.get, { id });
  const channels = useQuery(api.functions.channel.list, { id });
  const router = useRouter();
  const removeChannel = useMutation(api.functions.channel.remove);
  const removeServer = useMutation(api.functions.server.remove);
  const [isDeletingServer, setIsDeletingServer] = useState(false);

  const handleChannelDelete = async (channelId: Id<"channels">) => {
    try {
      // Delete the channel first
      await removeChannel({ id: channelId });

      // If we're currently on the deleted channel, redirect to default channel
      if (pathname === `/servers/${id}/channels/${channelId}` && server) {
        router.push(
          `/servers/${server._id}/channels/${server.defaultChannelId}`
        );
      }

      toast.success("Channel deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete channel:", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleServerDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${server?.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeletingServer(true);
    try {
      await removeServer({ id });
      toast.success("Server deleted successfully!");
      router.push("/dms"); // Redirect to DMs after server deletion
    } catch (error) {
      toast.error("Failed to delete server:", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsDeletingServer(false);
    }
  };

  return (
    <Sidebar className="left-12">
      <SidebarHeader className="flex items-center justify-between">
        <span>{server?.name}</span>
        {server && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-muted rounded">
                <Settings className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={handleServerDelete}
                className="text-destructive"
                disabled={isDeletingServer}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                {isDeletingServer ? "Deleting..." : "Delete Server"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Channel</SidebarGroupLabel>
          <CreateChannel serverId={id} />
          <SidebarGroupContent>
            <SidebarMenu>
              {channels?.map((channel) => (
                <SidebarMenuItem key={channel._id}>
                  <SidebarMenuButton
                    isActive={
                      pathname === `/servers/${id}/channels/${channel._id}`
                    }
                    asChild
                    className="group-data-[collapsible=icon]:!p-0"
                    tooltip={channel.name}
                  >
                    <Link href={`/servers/${id}/channels/${channel._id}`}>
                      {channel.name}
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={() => handleChannelDelete(channel._id)}
                  >
                    <TrashIcon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {" "}
                <Voice serverId={id} />{" "}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === `/servers/${id}/members`}
                  asChild
                  className="group-data-[collapsible=icon]:!p-0"
                >
                  <Link href={`/servers/${id}/members`}>
                    <Users className="h-4 w-4" />
                    Members
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

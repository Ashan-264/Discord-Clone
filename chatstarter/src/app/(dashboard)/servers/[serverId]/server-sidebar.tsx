import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
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
} from "@/components/ui/sidebar";
import Link from "next/link";

import { Id } from "../../../../../convex/_generated/dataModel";

export function ServerSidebar({ id }: { id: Id<"servers"> }) {
  const pathname = usePathname();
  const server = useQuery(api.functions.server.get, { id });
  const channels = useQuery(api.functions.channel.list, { id });
  return (
    <Sidebar className="left-12">
      <SidebarHeader>{server?.name}</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Channel</SidebarGroupLabel>
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
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

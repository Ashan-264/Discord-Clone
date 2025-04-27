import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreateServer } from "./dms/create-server";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MainSidebar() {
  const servers = useQuery(api.functions.server.list);
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Direct Messages"
                  isActive={pathname.startsWith("/dms")}
                  asChild
                >
                  <Link href="/dms">
                    <UserIcon />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <CreateServer />
              </SidebarMenuItem>
              {servers?.map((server) => (
                <SidebarMenuItem key={server._id}>
                  <SidebarMenuButton
                    className="group-data-[collapsible=icon]:!p-0"
                    tooltip={server.name}
                  >
                    <Link
                      href={`/servers/${server._id}/channels/${server.defaultChannelId}`}
                    >
                      {server.iconId ? (
                        <Avatar className="rounded-none">
                          {server.iconUrl && (
                            <AvatarImage
                              src={server.iconUrl}
                              alt={server.name}
                            />
                          )}
                          <AvatarFallback delayMs={600}>
                            <UserIcon />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <UserIcon />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 py-3">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}

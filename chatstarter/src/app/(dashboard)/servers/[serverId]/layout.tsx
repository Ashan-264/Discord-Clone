"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Id } from "../../../../../convex/_generated/dataModel";
import { usePathname } from "next/navigation";

import { use } from "react";
import { ServerSidebar } from "./server-sidebar";
import { ServerMembers } from "./server-members";

export default function ServerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: Id<"servers"> }>;
}) {
  const { serverId } = use(params);
  const pathname = usePathname();

  // Don't show ServerMembers component when on the members page
  const showServerMembers = !pathname.includes("/members");

  return (
    <SidebarProvider>
      <ServerSidebar id={serverId} />
      {children}
      {showServerMembers && <ServerMembers id={serverId} />}
    </SidebarProvider>
  );
}

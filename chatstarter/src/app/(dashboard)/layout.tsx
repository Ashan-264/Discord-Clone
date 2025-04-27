"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RedirectToSignIn } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { MainSidebar } from "./main-sidebar";
import { Analytics } from "@vercel/analytics/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {" "}
      <Authenticated>
        <SidebarProvider defaultOpen={false}>
          <MainSidebar />
          {children} <Analytics />
        </SidebarProvider>{" "}
      </Authenticated>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
    </>
  );
}

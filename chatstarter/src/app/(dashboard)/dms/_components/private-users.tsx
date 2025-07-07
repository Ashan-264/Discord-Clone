"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "../../../../components/ui/badge";
import { Shield, User, EyeOff } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function PrivateUsers() {
  const privateUsers = useQuery(api.functions.user.getPrivateUsers);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <span className="flex items-center gap-2">
          <EyeOff className="h-4 w-4" />
          Private Users ({privateUsers?.length || 0})
        </span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {privateUsers?.map((user) => (
            <SidebarMenuItem key={user._id}>
              <SidebarMenuButton className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>
                      {user.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.username}</span>
                  <Badge
                    variant={
                      user.role === "admin" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {user.role === "admin" ? (
                      <Shield className="h-2 w-2 mr-1" />
                    ) : (
                      <User className="h-2 w-2 mr-1" />
                    )}
                    {user.role || "user"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Private
                  </Badge>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {privateUsers?.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <EyeOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No private users found</p>
            </div>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Shield, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function PublicUsers() {
  const currentUser = useQuery(api.functions.user.get);
  const publicUsers = useQuery(api.functions.user.getPublicUsers);
  const setPrivacy = useMutation(api.functions.user.setPrivacy);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTogglePrivacy = async () => {
    if (!currentUser) return;

    setIsUpdating(true);
    try {
      await setPrivacy({ isPrivate: !currentUser.isPrivate });
      toast.success(
        `Account set to ${currentUser.isPrivate ? "public" : "private"}`
      );
    } catch (error) {
      toast.error("Failed to update privacy setting", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentUser) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Public Users ({publicUsers?.length || 0})
        </span>
        <Button
          onClick={handleTogglePrivacy}
          disabled={isUpdating}
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs"
        >
          {isUpdating ? (
            "Updating..."
          ) : currentUser.isPrivate ? (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Public
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Private
            </>
          )}
        </Button>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {publicUsers?.map((user) => (
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
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {publicUsers?.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No public users found</p>
            </div>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

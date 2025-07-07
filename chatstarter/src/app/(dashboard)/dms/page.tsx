"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AddFriend } from "./_components/add-friend";
import {
  AcceptedFriendsList,
  PendingFriendsList,
} from "./_components/friends-list";
import { PublicUsers } from "./_components/public-users";
import { PrivateUsers } from "./_components/private-users";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DMsPage() {
  const isAdmin = useQuery(api.functions.user.isAdmin);

  return (
    <div className="flex-1 flex-col flex divide-y">
      <header>
        <h1 className="font-semibold">Direct Messages</h1>
        <AddFriend />
        <TooltipProvider delayDuration={0}>
          <PendingFriendsList />
          <AcceptedFriendsList />
          <PublicUsers />
          {isAdmin && <PrivateUsers />}
        </TooltipProvider>
      </header>
    </div>
  );
}

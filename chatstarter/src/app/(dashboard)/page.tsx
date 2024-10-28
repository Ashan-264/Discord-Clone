"use client";

import { Button } from "@/components/ui/button";
import { AddFriend } from "./_components/add-friend";
import {
  AcceptedFriendsList,
  PendingFriendsList,
} from "./_components/friends-list";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function FriendsPage() {
  return (
    <div className="flex-1 flex-col flex divide-y ">
      <header>
        <h1 className="font-semibold">Friends</h1>
        <AddFriend />
        <TooltipProvider delayDuration={0}>
          <PendingFriendsList />
          <AcceptedFriendsList />
        </TooltipProvider>
      </header>
    </div>
  );
}

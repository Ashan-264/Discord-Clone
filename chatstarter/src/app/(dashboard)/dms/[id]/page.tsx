"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Id } from "../../../../../convex/_generated/dataModel";

import { Messages } from "@/components/messages";
import { useQuery } from "convex/react";
import { use } from "react";
import { api } from "../../../../../convex/_generated/api";

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: Id<"directMessages"> }>;
}) {
  const { id } = use(params);
  const directMessage = useQuery(api.functions.dm.get, {
    id,
  });

  // Ref for the ScrollAreaViewport

  if (!directMessage) {
    return null;
  }
  return (
    <div className="flex flex-col flex-1 divide-y max-h-screen">
      <header className="flex items-center gap-2 p-4">
        <Avatar className="size-8 border">
          <AvatarImage src={directMessage.user.image} />
          <AvatarFallback></AvatarFallback>
        </Avatar>
        <h1 className="font-semibold">{directMessage.user.username}</h1>
      </header>
      <Messages id={id} />
    </div>
  );
}

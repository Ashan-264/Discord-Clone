"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
//import { ScrollArea } from "@radix-ui/react-scroll-area";

import { Doc, Id } from "../../../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useMutation, useQuery } from "convex/react";
import { use, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { toast } from "sonner";

import { AddFriend } from "./_components/add-friend";
import {
  AcceptedFriendsList,
  PendingFriendsList,
} from "./_components/friends-list";
import { TooltipProvider } from "@/components/ui/tooltip";

function FriendsPage() {
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

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: Id<"directMessages"> }>;
}) {
  const { id } = use(params);
  const directMessage = useQuery(api.functions.dm.get, {
    id,
  });
  const messages = useQuery(api.functions.message.list, { directMessage: id });
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
      {/* <ScrollArea className="h-full py-4">
        {messages?.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
      </ScrollArea> */}
      <MessageInput directMessage={directMessage._id} />
    </div>
  );
}
type Message = FunctionReturnType<typeof api.functions.message.list>[number];
function MessageItem({ message }: { message: Message }) {
  return (
    <div className="flex items-center gap-2 px-4">
      <Avatar className="size-8 border">
        {message.sender && <AvatarImage src={message.sender?.image} />}
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <div className="flex flex-col mr-auto">
        <p className="text-xs text-muted-foreground">
          {message.sender?.username ?? "Deleted User"}
        </p>
        <p className="text-sm ">S{message.content}</p>
      </div>
      <MessageActions message={message} />
    </div>
  );
}
function MessageActions({ message }: { message: Message }) {
  const user = useQuery(api.functions.user.get);
  if (!user || message.sender?._id !== user._id) {
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVerticalIcon className="size-4 text-muted-foreground" />
        <span className="sr-only">Message Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="text-destructive">
          <TrashIcon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function MessageInput({
  directMessage,
}: {
  directMessage: Id<"directMessages">;
}) {
  const [content, setContent] = useState("");
  const sendMessage = useMutation(api.functions.message.create);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendMessage({ directMessage, content });
      setContent("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <form className="flex items-center p-4 gap-2" onSubmit={handleSubmit}>
      <Input
        placeholder="Message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <Button size="icon">
        <SendIcon />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}

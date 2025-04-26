"use client";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";
//import { ChannelForm } from "./channel-form"; // Adjust the path if `channel-form` is in a different location

export default function CreateChannel({
  serverId,
}: {
  serverId: Id<"servers">;
}) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const createChannel = useMutation(api.functions.channel.create);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const channelId = await createChannel({ name, serverId });
      router.push(`/servers/${serverId}/channels/${channelId}`);
      toast.success("Channel created successfully!");
      setOpen(false); // Close the dialog after successful creation
    } catch (error) {
      toast.error("Failed to create channel:", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction>
          <PlusIcon />
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Create a new channel in this server.
          </DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button type="submit">Create Channel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

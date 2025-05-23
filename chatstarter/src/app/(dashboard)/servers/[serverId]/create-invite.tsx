import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";

export function CreateInvite({ serverId }: { serverId: Id<"servers"> }) {
  const [inviteId, setInviteId] = useState<Id<"invites"> | null>(null);
  const createInvite = useMutation(api.functions.invite.create);
  const handleSubmit = async (
    maxUses: number | undefined,
    expiresAt: number | undefined
  ) => {
    try {
      const inviteId = await createInvite({ serverId, maxUses, expiresAt });
      setInviteId(inviteId);
      toast.success("Invite created successfully!");
    } catch (error) {
      toast.error("Failed to create invite:", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Create Invite
        </Button>
      </DialogTrigger>
      {inviteId ? (
        <CreatedInvite inviteId={inviteId} onClose={() => setInviteId(null)} />
      ) : (
        <CreateInviteForm onSubmit={handleSubmit} />
      )}
    </Dialog>
  );
}

const EXPIRES_AT_OPTIONS = [
  { label: "1 hour", value: 1 },
  { label: "6 hours", value: 6 },
  { label: "12 hours", value: 12 },
  { label: "1 day", value: 24 },
  { label: "Never", value: 0 },
];

const MAX_USES = [
  { label: "1", value: 1 },
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

function CreateInviteForm({
  onSubmit,
}: {
  onSubmit: (
    maxUses: number | undefined,
    expiresAt: number | undefined
  ) => void;
}) {
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const ParseNumber = (str: string) => {
    const value = parseInt(str, 10);
    if (!value) return undefined;
    return value;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedMaxUses = ParseNumber(maxUses);
    const parsedExpiresAt = ParseNumber(expiresAt);
    onSubmit(
      parsedMaxUses,
      parsedExpiresAt
        ? Date.now() + parsedExpiresAt * 60 * 60 * 1000
        : undefined
    ); // Convert hours to milliseconds
  };
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create Invite</DialogTitle>
      </DialogHeader>

      <form className="contents" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="expiresAt">Expires At</Label>
          <Select value={expiresAt} onValueChange={setExpiresAt}>
            <SelectTrigger
              id="expiresAt"
              className="
                w-full px-3 py-2
                border border-gray-300 rounded-md
                text-left flex items-center justify-between
                hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500
              "
              aria-label="Expires At"
            >
              <SelectValue placeholder="Select expiration time" />
            </SelectTrigger>
            <SelectContent
              className="
                mt-1 w-full bg-white dark:bg-surface  rounded-md shadow-lg
                max-h-60 overflow-auto py-1 z-50
              "
            >
              {EXPIRES_AT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value.toString()}
                  className="
                    px-3 py-2 rounded-md cursor-pointer
                    hover:bg-gray-100 focus:bg-gray-100
                  "
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Label htmlFor="maxUses">Max Uses</Label>
          <Select value={maxUses} onValueChange={setMaxUses}>
            <SelectTrigger
              id="maxUses"
              className="
                w-full px-3 py-2
                border border-gray-300 rounded-md
                 text-left flex items-center justify-between
                hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500
              "
              aria-label="Max Uses"
            >
              <SelectValue placeholder="Select max uses" />
            </SelectTrigger>
            <SelectContent
              className="
                mt-1 w-full bg-white dark:bg-surface rounded-md shadow-lg
                max-h-60 overflow-auto py-1 z-50
              "
            >
              {MAX_USES.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value.toString()}
                  className="
                    px-3 py-2 rounded-md cursor-pointer
                    hover:bg-gray-100 focus:bg-gray-100
                  "
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="flex justify-end space-x-2 mt-6">
          <Button type="submit">Create Invite</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function CreatedInvite({
  inviteId,
  onClose,
}: {
  inviteId: Id<"invites">;
  onClose: () => void;
}) {
  const url = new URL(`/join/${inviteId}`, window.location.href).toString();
  return (
    <DialogContent>
      <DialogHeader className="mb-6">
        <DialogTitle>Create Invite</DialogTitle>
        <DialogDescription>
          Create a new invite link for this server.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-gap-2 mb-6">
        <Label htmlFor="url">Invite URL</Label>
        <Input id="url" type="text" value={url} readOnly />
      </div>
      <DialogFooter className="flex justify-end space-x-2">
        <Button
          onClick={() => {
            navigator.clipboard.writeText(url);
            toast.success("Invite URL copied to clipboard!");
          }}
        >
          Copy
        </Button>

        <Button variant="secondary" onClick={onClose}>
          Back
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

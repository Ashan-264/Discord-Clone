import { DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageIcon, PlusIcon } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { api } from "../../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateServer() {
  const imageUpload = useImageUpload();
  const createServer = useMutation(api.functions.server.create);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    try {
      const { serverId, defaultChannelId } = await createServer({
        name,
        iconId: imageUpload.storageId,
      });
      router.push(`/channels/${serverId}/${defaultChannelId}`);
    } catch (error) {
      toast.error("Error creating server. Please try again.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <SidebarMenuButton tooltip="Create Server">
          <PlusIcon />
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
        </DialogHeader>
        <form className="contents" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name"> Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap2">
            <Label>Icon</Label>
            <div className="flex items-center">
              <input {...imageUpload.InputProps} />
              <Avatar className="size-10 border relative">
                {imageUpload.previewUrl && (
                  <AvatarImage
                    src={imageUpload.previewUrl}
                    className="absolute inset-0"
                  />
                )}
                <AvatarFallback>
                  <ImageIcon className="text-muted-foreground size-4" />
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                type="button"
                size="sm"
                onClick={imageUpload.open}
                disabled={imageUpload.isUploading}
              >
                Upload Image
              </Button>
            </div>
            <Button type="submit">Create Server</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

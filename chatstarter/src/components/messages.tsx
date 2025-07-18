import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Id } from "../../convex/_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  SendIcon,
  TrashIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useImageUpload } from "@/hooks/use-image-upload";

export function Messages({
  id,
}: {
  id: Id<"directMessages"> | Id<"channels">;
}) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messages = useQuery(api.functions.message.list, { dmOrChannelId: id });
  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        {messages?.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
      </ScrollArea>
      <div className="mt-auto">
        <TypingIndicator id={id} />
        <MessageInput id={id} scrollAreaRef={scrollAreaRef} />
      </div>
    </div>
  );
}
function TypingIndicator({ id }: { id: Id<"directMessages" | "channels"> }) {
  const username = useQuery(api.functions.typing.list, { dmOrChannelId: id });
  if (!username || username?.length === 0) {
    return null;
  }
  return (
    <div className="text-sm text-muted-foreground px-4 py-2">
      {username.join(",")} is typing...
    </div>
  );
}

type Message = FunctionReturnType<typeof api.functions.message.list>[number];
function MessageItem({ message }: { message: Message }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Avatar className="size-8 border">
        {message.sender && <AvatarImage src={message.sender?.image} />}
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <div className="flex flex-col mr-auto">
        <p className="text-xs text-muted-foreground">
          {message.sender?.username ?? "Deleted User"}
        </p>
        {message.deleted ? (
          <>
            <p className="text-sm text-destructive">
              This message was deleted.
              {message.deletedReason && (
                <span> Reason: {message.deletedReason}</span>
              )}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm ">{message.content}</p>
            {message.attatchment && (
              <Image
                src={message.attatchment}
                alt="Attatchment"
                width={300}
                height={300}
                className="rounded border overflow-hidden"
              />
            )}
          </>
        )}
      </div>
      <MessageActions message={message} />
    </div>
  );
}
function MessageActions({ message }: { message: Message }) {
  const user = useQuery(api.functions.user.get);
  const removeMutation = useMutation(api.functions.message.remove);
  if (!user || message.sender?._id !== user._id) {
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVerticalIcon className="size-4 text-muted-foreground" />
        <span className="sr-only">Message Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => removeMutation({ id: message._id })}
        >
          <TrashIcon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function MessageInput({
  id,
  scrollAreaRef,
}: {
  id: Id<"directMessages" | "channels">;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}) {
  const [content, setContent] = useState("");
  const sendMessage = useMutation(api.functions.message.create);
  const sendTypingIndicator = useMutation(api.functions.typing.upsert);

  const ImageUpload = useImageUpload();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendMessage({
        dmOrChannelId: id,
        attatchment: ImageUpload.storageId,
        content,
      });
      setContent("");
      ImageUpload.reset();

      setTimeout(() => {
        const scrollContainer = scrollAreaRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      toast.error(`Failed to send message: ${error}`);
    }
  };

  return (
    <>
      <form className="flex items-end p-4 gap-2" onSubmit={handleSubmit}>
        <Button
          type="button"
          size="icon"
          onClick={() => {
            ImageUpload.open();
          }}
        >
          <PlusIcon />
          <span className="sr-only">Attatchment</span>
        </Button>
        <div className="flex flex-col flex-1 gap-2">
          {ImageUpload.previewUrl && (
            <ImagePreview
              url={ImageUpload.previewUrl}
              isUploading={ImageUpload.isUploading}
              onDelete={ImageUpload.reset}
            />
          )}
          <Input
            placeholder="Message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={() => {
              if (content.length > 0) {
                sendTypingIndicator({ dmOrChannelId: id });
              }
            }}
          />
        </div>
        <Button size="icon">
          <SendIcon />
          <span className="sr-only">Send</span>
        </Button>
      </form>

      <input {...ImageUpload.InputProps} />
    </>
  );
}

function ImagePreview({
  url,
  isUploading,
  onDelete,
}: {
  url: string;
  isUploading: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="relative size-40 overflow-hidden rounded border group">
      <Image src={url} alt="Attachment" width={300} height={300} />
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <LoaderIcon className="animate-spin size-8" />
        </div>
      )}
      <Button
        type="button"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        variant="destructive"
        size="icon"
        onClick={onDelete}
      >
        <TrashIcon />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { FC } from "react";
import { CheckIcon, MessageCircleIcon, XIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

// Main FriendsPage component
export const FriendsPage: FC = () => {
  const acceptedFriends = useQuery(api.functions.friend.listAccepted);
  const pendingFriends = useQuery(api.functions.friend.listPending);
  const updateStatus = useMutation(api.functions.friend.updateStatus);

  if (!acceptedFriends || !pendingFriends) return <p>Loading friends...</p>;

  return (
    <div className="p-4">
      {/* Accepted Friends Section */}
      <div className="flex flex-col divide-y mb-6">
        <h2 className="text-xs font-medium text-muted-foreground p-2.5">
          Accepted Friends
        </h2>
        {acceptedFriends.length === 0 && (
          <FriendsListEmpty>You dont have any friends yet</FriendsListEmpty>
        )}
        {acceptedFriends.map((friend) => (
          <FriendItem
            key={friend._id}
            username={friend.user.username}
            image={friend.user.image}
          >
            {/* Direct Message Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  title="DM"
                  icon={<MessageCircleIcon />}
                  onClick={() => {
                    // Handle direct messaging here
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>Start DM</TooltipContent>
            </Tooltip>

            {/* Remove Friend Button */}
            <IconButton
              title="Remove Friend"
              icon={<XIcon />}
              className="bg-red-100"
              onClick={() =>
                updateStatus({ id: friend._id, status: "rejected" })
              }
            />
          </FriendItem>
        ))}
      </div>

      {/* Pending Friends Section */}
      <div className="flex flex-col divide-y">
        <h2 className="text-xs font-medium text-muted-foreground p-2.5">
          Pending Friends
        </h2>
        {pendingFriends.length === 0 && (
          <FriendsListEmpty>
            You dont have any pending friend requests
          </FriendsListEmpty>
        )}
        {pendingFriends.map((friend) => (
          <FriendItem
            key={friend._id}
            username={friend.user.username}
            image={friend.user.image}
          >
            {/* Accept Friend Request */}
            <IconButton
              title="Accept"
              icon={<CheckIcon />}
              className="bg-green-100"
              onClick={() =>
                updateStatus({ id: friend._id, status: "accepted" })
              }
            />

            {/* Reject Friend Request */}
            <IconButton
              title="Reject"
              icon={<XIcon />}
              className="bg-red-100"
              onClick={() =>
                updateStatus({ id: friend._id, status: "rejected" })
              }
            />
          </FriendItem>
        ))}
      </div>
    </div>
  );
};

// Helper component to display an empty state message
function FriendsListEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 bg-muted/50 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

// Reusable icon button component with tooltip
function IconButton({
  title,
  className,
  icon,
  onClick,
}: {
  title: string;
  className?: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={`rounded-full ${className || ""}`}
          variant="outline"
          size="icon"
          onClick={onClick}
        >
          {icon}
          <span className="sr-only">{title}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
}

// Friend item component that displays an avatar, username, and action buttons
function FriendItem({
  username,
  image,
  children,
}: {
  username: string;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 gap-2.5">
      <div className="flex items-center gap-2.5">
        <Avatar className="size-9 border">
          <AvatarImage src={image || "/default-avatar.png"} />
          <AvatarFallback>{username[0]}</AvatarFallback>
        </Avatar>
        <p className="text-sm font-medium">{username}</p>
      </div>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

export default FriendsPage;

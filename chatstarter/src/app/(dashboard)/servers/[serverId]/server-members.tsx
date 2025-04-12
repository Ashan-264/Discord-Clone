import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export function ServerMembers({ id }: { id: Id<"servers"> }) {
  const members = useQuery(api.functions.server.members, { id });
  return (
    <div className="flex flex-col max-w-80 w-full-borders rounded-md p-2 bg-background">
      {members?.map((member) => (
        <Avatar key={member._id}>
          <AvatarImage src={member.image} className="w-8 h-8" />
          <AvatarFallback className="w-8 h-8">
            {member.username[0]}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}

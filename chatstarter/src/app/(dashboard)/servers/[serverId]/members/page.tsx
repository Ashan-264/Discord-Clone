"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Badge } from "../../../../../components/ui/badge";
import { Shield, User } from "lucide-react";

export default function MembersPage({
  params,
}: {
  params: { serverId: Id<"servers"> };
}) {
  const members = useQuery(api.functions.server.members, {
    id: params.serverId,
  });
  const server = useQuery(api.functions.server.get, { id: params.serverId });

  if (!server) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading server...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="p-4 border-b">
        <h1 className="font-semibold">Members - {server.name}</h1>
        <p className="text-sm text-muted-foreground">
          {members?.length || 0} members
        </p>
      </header>

      <div className="flex-1 p-4">
        <div className="space-y-2">
          {members?.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.image} />
                  <AvatarFallback>
                    {member.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{member.username}</p>
                    <Badge
                      variant={
                        member.role === "admin" ? "destructive" : "secondary"
                      }
                    >
                      {member.role === "admin" ? (
                        <Shield className="h-3 w-3 mr-1" />
                      ) : (
                        <User className="h-3 w-3 mr-1" />
                      )}
                      {member.role || "user"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.email || "No email"}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {members?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No members found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

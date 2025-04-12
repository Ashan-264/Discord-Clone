"use client";
import { Messages } from "@/components/messages";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { use } from "react";

export default function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: Id<"channels"> }>;
}) {
  const { channelId } = use(params);
  return (
    <div className="flex flex-1 flex-col">
      <Messages id={channelId} />
    </div>
  );
}

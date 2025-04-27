"use client";

import "@livekit/components-styles";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { PhoneIcon } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

export function Voice({ serverId }: { serverId: Id<"servers"> }) {
  const server = useQuery(api.functions.server.get, { id: serverId });

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !server) return;
    setError(null);
    setToken(null);

    fetch(`/api/livekit-token?serverId=${server._id}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Failed to fetch token");
        }
        return res.json();
      })
      .then((data) => setToken(data.token))
      .catch((e) => {
        console.error("Token fetch failed:", e);
        setError(e.message);
      });
  }, [open, server]);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <SidebarMenuButton>
            <PhoneIcon /> Voice
          </SidebarMenuButton>
        </DialogTrigger>

        <DialogContent
          className="
            fixed inset-0 flex items-center justify-center p-4
            bg-[hsl(var(--background)/0.8)]
          "
        >
          {/* modal container */}
          <div className="relative w-full max-w-5xl h-[90vh] bg-surface rounded-lg overflow-hidden flex-col ">
            <DialogTitle className="absolute top-4 left-4 z-10 text-foreground">
              Voice Chat
            </DialogTitle>

            {/* LiveKit UI */}
            {token && (
              <LiveKitRoom
                token={token}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
                onDisconnected={() => setOpen(false)}
              >
                <VideoConference />
              </LiveKitRoom>
            )}

            {/* Loading / error states */}
            {!server ? (
              <p className="absolute inset-0 flex items-center justify-center">
                Loading server info…
              </p>
            ) : error ? (
              <p className="absolute inset-0 flex items-center justify-center text-red-500">
                Error: {error}
              </p>
            ) : !token ? (
              <p className="absolute inset-0 flex items-center justify-center">
                Generating LiveKit token…
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

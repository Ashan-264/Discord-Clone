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
import { AccessToken } from "livekit-server-sdk";

export function Voice({ serverId }: { serverId: Id<"servers"> }) {
  const server = useQuery(api.functions.server.get, { id: serverId });

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1) When the dialog opens, build a LiveKit Access Token in-browser
  useEffect(() => {
    if (!open || !server) return;
    setError(null);
    setToken(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_LIVEKIT_API_KEY!;
      const apiSecret = process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET!;
      if (!apiKey || !apiSecret) {
        throw new Error("Missing NEXT_PUBLIC_LIVEKIT_API_KEY or _SECRET");
      }

      const at = new AccessToken(apiKey, apiSecret, {
        identity: server._id.toString(),
      });

      at.addGrant({
        room: server._id,
        roomJoin: true,
      });

      at.toJwt()
        .then(setToken)
        .catch((e) => {
          console.error("LiveKit token build error", e);
          setError(e.message || "Failed to build LiveKit token");
        });
    } catch (e: any) {
      console.error("LiveKit token build error", e);
      setError(e.message || "Failed to build LiveKit token");
    }
  }, [open, server]);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <SidebarMenuButton>
            <PhoneIcon /> Voice
          </SidebarMenuButton>
        </DialogTrigger>

        <DialogContent className="fixed inset-0 flex items-center justify-center p-4">
          <DialogTitle>Voice Chat</DialogTitle>

          {token && (
            <LiveKitRoom
              className="w-full h-full"
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
              onDisconnected={() => setOpen(false)}
            >
              <VideoConference />
            </LiveKitRoom>
          )}

          {!server ? (
            <p>Loading server info…</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : !token ? (
            <p>Generating LiveKit token…</p>
          ) : (
            <p>Token ready! Closing this dialog to join.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* <Dialog>
        <DialogContent className="max-w-screen-lg">
          <DialogTitle className="sr-only">Voice</DialogTitle>
          
        </DialogContent>
      </Dialog> */}
    </div>
  );
}

// "use client";

// import { useQuery } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { Id } from "../../../../convex/_generated/dataModel";
// import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
// import { SidebarMenuButton } from "@/components/ui/sidebar";
// import { PhoneIcon } from "lucide-react";
// import { DialogTitle } from "@/components/ui/dialog";
// import { useEffect, useRef, useState } from "react";
// import AgoraRTC, {
//   IAgoraRTCClient,
//   IMicrophoneAudioTrack,
//   ICameraVideoTrack,
// } from "agora-rtc-sdk-ng";
// import { RtcTokenBuilder, RtcRole } from "agora-token";

// type TokenInfo = {
//   appId: string;
//   channelName: string;
//   token: string;
//   uid: string;
// };

// export function Voice({ serverId }: { serverId: Id<"servers"> }) {
//   const server = useQuery(api.functions.server.get, { id: serverId });

//   const [open, setOpen] = useState(false);
//   const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
//   const [joined, setJoined] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const clientRef = useRef<IAgoraRTCClient | null>(null);
//   const localTrackRef = useRef<
//     [IMicrophoneAudioTrack, ICameraVideoTrack] | null
//   >(null);

//   // 1) Build the Agora token in-browser
//   useEffect(() => {
//     if (!open || !server) return;
//     setError(null);
//     setTokenInfo(null);

//     try {
//       const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
//       const appCertificate = process.env.NEXT_PUBLIC_AGORA_APP_CERTIFICATE!;
//       if (!appId || !appCertificate) {
//         throw new Error("Missing NEXT_PUBLIC_AGORA_* env vars");
//       }

//       const channelName = server._id; // or any string
//       const uid = server._id.toString(); // must be numeric-ish
//       const now = Math.floor(Date.now() / 1000);
//       const ttl = 3600; // 1 hour
//       const tokenExpireTs = now + ttl;
//       const privilegeExpireTs = now + ttl;

//       const token = RtcTokenBuilder.buildTokenWithUid(
//         appId,
//         appCertificate,
//         channelName,
//         Number(uid),
//         RtcRole.PUBLISHER,
//         tokenExpireTs,
//         privilegeExpireTs
//       );

//       setTokenInfo({ appId, channelName, token, uid });
//     } catch (e: unknown) {
//       if (e instanceof Error) {
//         console.error("Token build error", e);
//         setError(e.message || "Failed to build Agora token");
//       } else {
//         console.error("Token build error", e);
//         setError("An unknown error occurred");
//       }
//     }
//   }, [open, server]);

//   // 2) Join the call once we have a token
//   useEffect(() => {
//     if (!open || !tokenInfo) return;

//     const client: IAgoraRTCClient = AgoraRTC.createClient({
//       mode: "rtc",
//       codec: "vp8",
//     });
//     clientRef.current = client;

//     (async () => {
//       try {
//         await client.join(
//           tokenInfo.appId,
//           tokenInfo.channelName,
//           tokenInfo.token,
//           Number(tokenInfo.uid)
//         );
//         const [micTrack, camTrack]: [IMicrophoneAudioTrack, ICameraVideoTrack] =
//           await AgoraRTC.createMicrophoneAndCameraTracks();
//         await client.publish([micTrack, camTrack]);
//         localTrackRef.current = [micTrack, camTrack];
//         setJoined(true);
//       } catch (e) {
//         console.error("Agora join failed", e);
//         setError("Failed to join Agora call");
//       }
//     })();

//     return () => {
//       (async () => {
//         if (clientRef.current) {
//           await clientRef.current.leave();
//           clientRef.current = null;
//         }
//         if (localTrackRef.current) {
//           const [mic, cam] = localTrackRef.current;
//           mic.stop();
//           cam.stop();
//           localTrackRef.current = null;
//         }
//         setJoined(false);
//       })();
//     };
//   }, [open, tokenInfo]);

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <SidebarMenuButton>
//           <PhoneIcon /> Voice
//         </SidebarMenuButton>
//       </DialogTrigger>

//       <DialogContent className="max-w-screen-lg">
//         <DialogTitle>Voice Chat</DialogTitle>

//         {!server ? (
//           <p>Loading server info…</p>
//         ) : error ? (
//           <p className="text-red-500">Error: {error}</p>
//         ) : !tokenInfo ? (
//           <p>Connecting to Agora…</p>
//         ) : !joined ? (
//           <p>Joining voice call…</p>
//         ) : (
//           <div className="text-center">
//             <p>You are connected to the call!</p>
//             <div id="agora-video-area" className="mt-4" />
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

// "use client";
// import { useQuery, useAction } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { Id } from "../../../../convex/_generated/dataModel";
// import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
// import { SidebarMenuButton } from "@/components/ui/sidebar";
// import { PhoneIcon } from "lucide-react";
// import { DialogTitle } from "@/components/ui/dialog";
// import { useEffect, useRef, useState } from "react";
// import AgoraRTC, {
//   IAgoraRTCClient,
//   IMicrophoneAudioTrack,
//   ICameraVideoTrack,
// } from "agora-rtc-sdk-ng";

// type TokenInfo = {
//   token: string;
//   appId: string;
//   channelName: string;
//   uid: string;
// };

// export function Voice({ serverId }: { serverId: Id<"servers"> }) {
//   // 1) Load your server record
//   const server = useQuery(api.functions.server.get, { id: serverId });
//   // 2) Grab the exact FunctionReference for your action
//   const createToken = useAction(api.functions.agora.createToken);

//   const [open, setOpen] = useState(false);
//   const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
//   const [joined, setJoined] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Strongly-typed refs for client and tracks
//   const clientRef = useRef<IAgoraRTCClient | null>(null);
//   const localTrackRef = useRef<
//     [IMicrophoneAudioTrack, ICameraVideoTrack] | null
//   >(null);

//   // When the dialog opens and server is ready, fetch a new token
//   useEffect(() => {
//     if (open && server) {
//       setError(null);
//       setTokenInfo(null);
//       createToken({
//         channelName: server._id,
//         uid: server._id.toString(),
//       })
//         .then(setTokenInfo)
//         .catch((err) => {
//           console.error("Token generation failed", err);
//           setError(err.message || "Failed to get Agora token");
//         });
//     }
//   }, [open, server, createToken]);

//   // When we have a token, join the Agora channel
//   useEffect(() => {
//     if (!open || !tokenInfo) return;

//     const client: IAgoraRTCClient = AgoraRTC.createClient({
//       mode: "rtc",
//       codec: "vp8",
//     });
//     clientRef.current = client;

//     (async () => {
//       try {
//         await client.join(
//           tokenInfo.appId,
//           tokenInfo.channelName,
//           tokenInfo.token,
//           Number(tokenInfo.uid)
//         );
//         const [microphoneTrack, cameraTrack]: [
//           IMicrophoneAudioTrack,
//           ICameraVideoTrack,
//         ] = await AgoraRTC.createMicrophoneAndCameraTracks();
//         await client.publish([microphoneTrack, cameraTrack]);
//         localTrackRef.current = [microphoneTrack, cameraTrack];
//         setJoined(true);
//       } catch (err) {
//         console.error("Agora join failed", err);
//         setError("Failed to join Agora call");
//       }
//     })();

//     // Cleanup when the dialog closes
//     return () => {
//       (async () => {
//         if (clientRef.current) {
//           await clientRef.current.leave();
//           clientRef.current = null;
//         }
//         if (localTrackRef.current) {
//           const [mic, cam] = localTrackRef.current;
//           mic.stop();
//           cam.stop();
//           localTrackRef.current = null;
//         }
//         setJoined(false);
//       })();
//     };
//   }, [open, tokenInfo]);

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <SidebarMenuButton>
//           <PhoneIcon /> Voice
//         </SidebarMenuButton>
//       </DialogTrigger>
//       <DialogContent className="max-w-screen-lg">
//         <DialogTitle>Voice Chat</DialogTitle>

//         {!server ? (
//           <p>Loading server info…</p>
//         ) : error ? (
//           <p className="text-red-500">Error: {error}</p>
//         ) : !tokenInfo ? (
//           <p>Connecting to Agora…</p>
//         ) : !joined ? (
//           <p>Joining voice call…</p>
//         ) : (
//           <div className="text-center">
//             <p>You are connected to the call!</p>
//             <div id="agora-video-area" className="mt-4" />
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

// "use client";
// import "@livekit/components-styles";
// import { LiveKitRoom, VideoConference } from "@livekit/components-react";
// import { useQuery } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { Id } from "../../../../convex/_generated/dataModel";
// import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
// import { SidebarMenuButton } from "@/components/ui/sidebar";
// import { PhoneIcon } from "lucide-react";
// import { DialogTitle } from "@/components/ui/dialog";
// import { useState, useEffect } from "react";

// export function Voice({ serverId }: { serverId: Id<"servers"> }) {
//   // Convex gives you the server object (or just its ID if you prefer a custom query)
//   const server = useQuery(api.functions.server.get, { id: serverId });

//   const [open, setOpen] = useState(false);
//   const [jwt, setJwt] = useState<string>();

//   // When the modal opens, fetch your Next.js token
//   useEffect(() => {
//     if (open && server) {
//       fetch(`/api/livekit-token?serverId=${server._id}`)
//         .then((res) => res.json())
//         .then((data) => setJwt(data.token))
//         .catch(console.error);
//     }
//   }, [open, server]);

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <SidebarMenuButton>
//           <PhoneIcon />
//           Voice
//         </SidebarMenuButton>
//       </DialogTrigger>

//       <DialogContent className="max-w-screen-lg">
//         <DialogTitle>Voice Chat</DialogTitle>

//         {!server ? (
//           <p>Loading server info…</p>
//         ) : !jwt ? (
//           <p>Connecting to LiveKit…</p>
//         ) : (
//           <LiveKitRoom
//             token={jwt}
//             serverUrl="wss://chatstarter-xilt9mhv.livekit.cloud"
//             onDisconnected={() => setOpen(false)}
//           >
//             <VideoConference />
//           </LiveKitRoom>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

// import "@livekit/components-styles";
// import { LiveKitRoom, VideoConference } from "@livekit/components-react";
// import { useQuery } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { Id } from "../../../../convex/_generated/dataModel";
// import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
// import { SidebarMenuButton } from "@/components/ui/sidebar";
// import { PhoneIcon } from "lucide-react";
// import { DialogTitle } from "@/components/ui/dialog";
// import { useState } from "react";

// export function Voice({ serverId }: { serverId: Id<"servers"> }) {
//   const token = useQuery(api.functions.livekit.getToken, { serverId });
//   const [open, setOpen] = useState(false);

//   return (
//     <div>
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogTrigger asChild>
//           <SidebarMenuButton>
//             <PhoneIcon />
//             Voice
//           </SidebarMenuButton>
//         </DialogTrigger>
//         <DialogContent className="max-w-screen-lg">
//           <DialogTitle className="sr-only">Voice</DialogTitle>
//         </DialogContent>
//       </Dialog>

//       <LiveKitRoom
//         token={token}
//         serverUrl="wss://chatstarter-xilt9mhv.livekit.cloud"
//         onDisconnected={() => setOpen(false)}
//       >
//         <VideoConference />
//       </LiveKitRoom>
//     </div>
//   );
// }

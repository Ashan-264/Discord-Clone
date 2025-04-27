"use client";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "../../../../convex/_generated/api";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";

export default function JoinPage({
  params,
}: {
  params: { id: Id<"invites"> };
}) {
  const { id } = params;
  const invite = useQuery(api.functions.invite.get, { id });
  const join = useMutation(api.functions.invite.join);
  const router = useRouter();

  const handleJoin = async () => {
    await join({ id });
    router.push(
      `/servers/${invite?.server._id}/channels/${invite?.server.defaultChannelId}`
    );
  };

  return (
    <div className="flex item-center justify-center h-screen w-screen ">
      <Card className="max-w-96 w-full">
        <CardHeader>
          <CardTitle>Join {invite?.server.name}</CardTitle>
          <CardDescription>
            Youve been invited to Join the server{" "}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col items-stretch gap-2">
          <Authenticated>
            <Button onClick={handleJoin}>Join Server</Button>
          </Authenticated>
          <Unauthenticated>
            <Button asChild>
              <SignInButton forceRedirectUrl={`/join/${id}`}>
                Sign In To Join
              </SignInButton>
            </Button>
          </Unauthenticated>
          <Button variant="secondary" asChild>
            <Link href="/dms">Not Now</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

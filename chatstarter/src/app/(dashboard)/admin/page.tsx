"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Send,
  Shield,
  User,
  Loader2,
  MessageSquare,
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function AdminPage() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.functions.user.get);
  const isAdminUser = useQuery(api.functions.user.isAdmin);
  const allUsers = useQuery(api.functions.user.getAllUsers);
  const sendMessage = useMutation(api.functions.user.sendDirectMessage);
  const syncEmail = useMutation(api.functions.user.syncCurrentUserEmail);
  const syncAllEmails = useMutation(api.functions.user.syncAllUserEmailsSimple);
  const setUserEmail = useMutation(api.functions.user.setUserEmail);

  const [selectedUser, setSelectedUser] = useState<Id<"users"> | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [editingEmail, setEditingEmail] = useState<Id<"users"> | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [isSettingEmail, setIsSettingEmail] = useState(false);

  const handleSyncEmail = async () => {
    setIsSyncing(true);
    try {
      const email = await syncEmail();
      toast.success(`Email synced: ${email}`);
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      toast.error("Failed to sync email", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAllEmails = async () => {
    setIsSyncingAll(true);
    try {
      const result = await syncAllEmails();
      toast.success(result.message);
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      toast.error("Failed to sync all emails", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleEditEmail = (userId: Id<"users">, currentEmail: string) => {
    setEditingEmail(userId);
    setEmailInput(currentEmail || "");
  };

  const handleSaveEmail = async () => {
    if (!editingEmail || !emailInput.trim()) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsSettingEmail(true);
    try {
      await setUserEmail({
        userId: editingEmail,
        email: emailInput.trim(),
      });
      toast.success("Email updated successfully!");
      setEditingEmail(null);
      setEmailInput("");
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update email", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSettingEmail(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEmail(null);
    setEmailInput("");
  };

  // Loading state
  if (isAdminUser === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Check if current user is admin
  if (!isAdminUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You don&apos;t have permission to access this page.
            </p>
            {clerkUser && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Debug Info:</p>
                <p className="text-xs text-muted-foreground">
                  Clerk Email:{" "}
                  {clerkUser.emailAddresses?.[0]?.emailAddress || "Not found"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Database Email: {currentUser?.email || "Not set"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Role: {currentUser?.role || "Not set"}
                </p>
                <Button
                  onClick={handleSyncEmail}
                  disabled={isSyncing}
                  size="sm"
                  className="mt-2"
                >
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sync Email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!selectedUser || !messageContent.trim()) {
      toast.error("Please select a user and enter a message");
      return;
    }

    setIsSending(true);
    try {
      await sendMessage({
        targetUserId: selectedUser,
        content: messageContent,
      });
      toast.success("Message sent successfully!");

      // Redirect to DMs page after sending
      router.push("/dms");
    } catch (error) {
      toast.error("Failed to send message", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSending(false);
    }
  };

  const usersWithoutEmails =
    allUsers?.filter((user) => !user.email).length || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-red-500" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage users and send direct messages as an administrator.
        </p>

        {/* Debug Info for Admin */}
        {currentUser && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current User Info:</p>
                <p className="text-xs text-muted-foreground">
                  Email: {currentUser.email || "Not set"}
                  {!currentUser.email && (
                    <Button
                      onClick={handleSyncEmail}
                      disabled={isSyncing}
                      size="sm"
                      variant="outline"
                      className="ml-2"
                    >
                      {isSyncing ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Sync
                    </Button>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Role: {currentUser.role || "Not set"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Users without emails: {usersWithoutEmails}
                </p>
                {usersWithoutEmails > 0 && (
                  <Button
                    onClick={handleSyncAllEmails}
                    disabled={isSyncingAll}
                    size="sm"
                    variant="outline"
                    className="mt-1"
                  >
                    {isSyncingAll ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Users className="h-3 w-3 mr-1" />
                    )}
                    Sync All Emails
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                All Users ({allUsers?.length || 0})
                {usersWithoutEmails > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {usersWithoutEmails} need email sync
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allUsers === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : allUsers?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allUsers?.map((user) => (
                    <div
                      key={user._id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUser === user._id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedUser(user._id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image} />
                          <AvatarFallback>
                            {user.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.username}</p>
                            <Badge
                              variant={
                                user.role === "admin"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {user.role === "admin" ? (
                                <Shield className="h-3 w-3 mr-1" />
                              ) : (
                                <User className="h-3 w-3 mr-1" />
                              )}
                              {user.role || "user"}
                            </Badge>
                            {!user.email && (
                              <Badge variant="outline" className="text-xs">
                                No Email
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {editingEmail === user._id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={emailInput}
                                  onChange={(e) =>
                                    setEmailInput(e.target.value)
                                  }
                                  placeholder="Enter email"
                                  className="text-xs h-6"
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleSaveEmail();
                                    }
                                  }}
                                />
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEmail();
                                  }}
                                  disabled={isSettingEmail}
                                  size="sm"
                                  className="h-6 px-2"
                                >
                                  {isSettingEmail ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    "Save"
                                  )}
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">
                                  {user.email || "Email not set"}
                                </p>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEmail(user._id, user.email || "");
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                >
                                  Edit
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send Direct Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedUser ? (
                <>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">To:</p>
                    <p className="text-sm text-muted-foreground">
                      {allUsers?.find((u) => u._id === selectedUser)?.username}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message:</label>
                    <Input
                      placeholder="Type your message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={isSending}
                    />
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || isSending}
                    className="w-full"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isSending ? "Sending..." : "Send Message"}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a user to send a message</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
